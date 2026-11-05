ALTER TABLE public.withdrawal_transactions DROP CONSTRAINT withdrawal_transactions_status_check;
ALTER TABLE public.withdrawal_transactions ADD CONSTRAINT withdrawal_transactions_status_check CHECK (status IN ('pending','confirmed','cancelled'));
ALTER TABLE public.withdrawal_transaction_reviews DROP CONSTRAINT withdrawal_transaction_reviews_status_check;
ALTER TABLE public.withdrawal_transaction_reviews ADD CONSTRAINT withdrawal_transaction_reviews_status_check CHECK (status IN ('pending','confirmed','cancelled'));
CREATE OR REPLACE FUNCTION public.admin_review_withdrawal(_id uuid, _status text, _reason text)
RETURNS public.withdrawal_transactions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.withdrawal_transactions;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin'::public.app_role) THEN RAISE EXCEPTION 'Only administrators can review transactions' USING ERRCODE='42501'; END IF;
 IF _status IS NULL OR _status NOT IN ('pending','confirmed','cancelled') THEN RAISE EXCEPTION 'Choose pending, confirmed or cancelled'; END IF;
 IF length(trim(coalesce(_reason,''))) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Provide a reason between 1 and 2000 characters'; END IF;
 SELECT * INTO t FROM public.withdrawal_transactions WHERE id=_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
 IF t.status='cancelled' THEN RAISE EXCEPTION 'Cancelled requests are final; the user can submit a new withdrawal'; END IF;
 UPDATE public.withdrawal_transactions SET status=_status,status_reason=trim(_reason),reviewed_by=auth.uid(),reviewed_at=now() WHERE id=_id RETURNING * INTO t;
 INSERT INTO public.withdrawal_transaction_reviews(transaction_id,status,reason,reviewed_by) VALUES(_id,_status,trim(_reason),auth.uid());
 RETURN t;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_review_withdrawal(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid,text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.request_withdrawal(_amount numeric, _account_holder text, _bank_name text, _account_type text, _account_number text, _routing_number text, _email text)
RETURNS public.withdrawal_transactions LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles; t public.withdrawal_transactions; reserved numeric;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to request a withdrawal' USING ERRCODE = '42501'; END IF;
 SELECT * INTO p FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;
 IF p.blocked THEN RAISE EXCEPTION 'Blocked accounts cannot withdraw' USING ERRCODE = '42501'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.kyc_submissions WHERE user_id=auth.uid() ORDER BY created_at DESC LIMIT 1) OR (SELECT status FROM public.kyc_submissions WHERE user_id=auth.uid() ORDER BY created_at DESC LIMIT 1) <> 'approved' THEN RAISE EXCEPTION 'Approved identity verification is required' USING ERRCODE = '42501'; END IF;
 IF _amount IS NULL OR _amount::text IN ('NaN','Infinity','-Infinity') OR _amount < 1 OR _amount <> round(_amount,2) THEN RAISE EXCEPTION 'Enter an amount of at least $1 with at most two decimal places'; END IF;
 SELECT coalesce(sum(amount),0) INTO reserved FROM public.withdrawal_transactions WHERE user_id=auth.uid() AND status IN ('pending','confirmed');
 IF _amount > p.balance - reserved THEN RAISE EXCEPTION 'Amount exceeds the balance available after pending and confirmed requests'; END IF;
 IF length(trim(coalesce(_account_holder,''))) NOT BETWEEN 1 AND 200 OR length(trim(coalesce(_bank_name,''))) NOT BETWEEN 1 AND 200 OR _account_type IS NULL OR _account_type NOT IN ('Checking','Savings') OR coalesce(_account_number,'') !~ '^[0-9]{4,17}$' OR coalesce(_routing_number,'') !~ '^[0-9]{9}$' OR coalesce(_email,'') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(_email)>254 THEN RAISE EXCEPTION 'Enter valid bank and contact details'; END IF;
 INSERT INTO public.withdrawal_transactions(user_id,amount,account_holder,bank_name,account_type,account_last4,routing_last4,email,status,status_reason) VALUES(auth.uid(),_amount,trim(_account_holder),trim(_bank_name),_account_type,right(_account_number,4),right(_routing_number,4),trim(_email),'pending','Awaiting administrator review.') RETURNING * INTO t;
 RETURN t;
END;
$$;
REVOKE ALL ON FUNCTION public.request_withdrawal(numeric,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric,text,text,text,text,text,text) TO authenticated;
COMMENT ON TABLE public.withdrawal_transactions IS 'Withdrawal review requests only, not bank payouts. Pending and confirmed requests reserve availability without changing stored balances. Only masked bank identifiers are retained.';