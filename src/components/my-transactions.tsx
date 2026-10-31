import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/transaction-list";
import type { WithdrawalTransaction, TransactionReview } from "@/lib/transactions";

export function MyTransactions({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<WithdrawalTransaction[]>([]);
  const [reviews, setReviews] = useState<TransactionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    const [t, r] = await Promise.all([
      supabase.from("withdrawal_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("withdrawal_transaction_reviews").select("*").order("created_at", { ascending: false }),
    ]);
    setError(!!(t.error || r.error));
    if (!t.error && !r.error) { setTransactions(t.data ?? []); setReviews(r.data ?? []); }
    setLoading(false);
  }, [userId]);
  useEffect(() => {
    void load();
    const reload = () => { if (document.visibilityState === "visible") void load(); };
    const interval = window.setInterval(reload, 15000);
    window.addEventListener("focus", reload);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", reload); };
  }, [load]);
  return <section className="mt-14"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-3xl">MY TRANSACTIONS</h2><Button variant="outline" size="icon" aria-label="Refresh transactions" title="Refresh transactions" onClick={() => void load()}><RefreshCw /></Button></div>{loading ? <p className="mt-6 text-muted-foreground">Loading transactions…</p> : error ? <p role="alert" className="mt-6 text-destructive">Could not load transactions. Please refresh.</p> : <TransactionList transactions={transactions} reviews={reviews} />}</section>;
}