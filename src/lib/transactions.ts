import type { Tables } from "@/integrations/supabase/types";

export type WithdrawalTransaction = Tables<"withdrawal_transactions">;
export type TransactionReview = Tables<"withdrawal_transaction_reviews">;
export type TransactionStatus = "pending" | "cancelled";

export function validateReview(status: string, reason: string) {
  if (status !== "pending" && status !== "cancelled") throw new Error("Choose pending or cancelled");
  const value = reason.trim();
  if (!value || value.length > 2000) throw new Error("Provide a reason between 1 and 2000 characters");
  return { status: status as TransactionStatus, reason: value };
}

export function availableForWithdrawal(balance: number, transactions: WithdrawalTransaction[]) {
  return Math.max(0, Math.round((balance - transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + Number(t.amount), 0)) * 100) / 100);
}

export const formatDollars = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD" });