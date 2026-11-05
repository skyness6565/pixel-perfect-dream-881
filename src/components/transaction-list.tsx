import { useState } from "react";
import { Clock, XCircle, CheckCircle2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDollars, validateReview, type WithdrawalTransaction, type TransactionReview, type TransactionStatus } from "@/lib/transactions";

type Props = {
  transactions: WithdrawalTransaction[];
  reviews: TransactionReview[];
  userLabel?: (id: string) => string;
  onReview?: (id: string, status: TransactionStatus, reason: string) => Promise<void>;
};

export function TransactionList({ transactions, reviews, userLabel, onReview }: Props) {
  if (!transactions.length) return <p className="py-6 text-muted-foreground">No withdrawal transactions yet.</p>;
  return <ul className="mt-6 space-y-4">{transactions.map(transaction => <TransactionItem key={transaction.id} transaction={transaction} reviews={reviews.filter(r => r.transaction_id === transaction.id)} label={userLabel?.(transaction.user_id)} onReview={onReview} />)}</ul>;
}

function TransactionItem({ transaction: t, reviews, label, onReview }: { transaction: WithdrawalTransaction; reviews: TransactionReview[]; label?: string; onReview?: Props["onReview"] }) {
  const [status, setStatus] = useState<TransactionStatus>(t.status === "confirmed" ? "confirmed" : "pending");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save() {
    if (!onReview || busy) return;
    setError(null);
    try {
      const review = validateReview(status, reason);
      setBusy(true);
      await onReview(t.id, review.status, review.reason);
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update transaction");
    } finally { setBusy(false); }
  }
  const cancelled = t.status === "cancelled";
  const confirmed = t.status === "confirmed";
  return <li className="min-w-0 rounded-md border border-border bg-card p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {label && <p className="break-words font-heading font-semibold">{label}</p>}
        <p className="font-display text-3xl">{formatDollars(Number(t.amount))}</p>
        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{t.reference}</p>
      </div>
      <span className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold ${cancelled ? "bg-destructive/10 text-destructive" : confirmed ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"}`}>{cancelled ? <XCircle className="size-4" /> : confirmed ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}{cancelled ? "Cancelled" : confirmed ? "Confirmed" : "Pending"}</span>
    </div>
    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Account holder</dt><dd className="break-words">{t.account_holder}</dd></div>
      <div><dt className="text-muted-foreground">Bank account</dt><dd className="break-words">{t.bank_name} · {t.account_type} · ••••{t.account_last4}</dd></div>
      <div><dt className="text-muted-foreground">Requested</dt><dd>{new Date(t.created_at).toLocaleString()}</dd></div>
      <div><dt className="text-muted-foreground">Email</dt><dd className="break-all">{t.email}</dd></div>
    </dl>
    <p className="mt-4 whitespace-pre-wrap break-words border-l-2 border-primary pl-3 text-sm"><strong>Reason: </strong>{t.status_reason}</p>
    {reviews.length > 0 && <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">Review history ({reviews.length})</summary><ul className="mt-3 space-y-3">{reviews.map(r => <li key={r.id} className="border-t border-border pt-3"><p className="capitalize">{r.status} · {new Date(r.created_at).toLocaleString()}</p><p className="whitespace-pre-wrap break-words text-muted-foreground">{r.reason}</p></li>)}</ul></details>}
    {onReview && !cancelled && <form className="mt-5 space-y-3 border-t border-border pt-4" onSubmit={e => { e.preventDefault(); void save(); }}>
      <div><label htmlFor={`status-${t.id}`} className="text-sm font-semibold">Transaction status</label><select id={`status-${t.id}`} value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} disabled={busy} className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-foreground"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></div>
      <div><label htmlFor={`reason-${t.id}`} className="text-sm font-semibold">Reason shown to user</label><textarea id={`reason-${t.id}`} value={reason} onChange={e => setReason(e.target.value)} disabled={busy} required maxLength={2000} rows={3} placeholder="Enter the reason" className="mt-1 block w-full rounded-md border border-input bg-background p-3 text-foreground" /></div>
      {status === "cancelled" && <p className="text-sm text-destructive">Cancellation is final. The pending amount becomes available again.</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} variant={status === "cancelled" ? "destructive" : "default"}>{busy ? <Loader2 className="animate-spin" /> : <Save />} {busy ? "Saving…" : "Save transaction status"}</Button>
    </form>}
  </li>;
}