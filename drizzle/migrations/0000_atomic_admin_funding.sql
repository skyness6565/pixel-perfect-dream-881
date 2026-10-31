CREATE OR REPLACE FUNCTION public.admin_adjust_balance(_user_id uuid, _amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE saved_balance numeric;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only administrators can fund accounts' USING ERRCODE = '42501';
  END IF;
  IF _amount IS NULL OR _amount = 0 OR _amount::text IN ('NaN', 'Infinity', '-Infinity') OR _amount <> round(_amount, 2) THEN
    RAISE EXCEPTION 'Enter a non-zero amount with at most two decimal places';
  END IF;
  UPDATE public.profiles SET balance = greatest(0, balance + _amount) WHERE id = _user_id RETURNING balance INTO saved_balance;
  IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;
  RETURN saved_balance;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_adjust_balance(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_balance(uuid, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.protect_profile_balance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    IF (TG_OP = 'INSERT' AND NEW.balance <> 0) OR (TG_OP = 'UPDATE' AND NEW.balance IS DISTINCT FROM OLD.balance) THEN
      RAISE EXCEPTION 'Only administrators can change balances' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_profile_balance() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER protect_profile_balance BEFORE INSERT OR UPDATE OF balance ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_balance();