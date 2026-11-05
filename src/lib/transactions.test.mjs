import { describe, expect, test } from "bun:test";
import { validateReview, availableForWithdrawal } from "./transactions.ts";

describe("administrator transaction reviews", () => {
  test("can mark a transaction pending with its reason", () => {
    expect(validateReview("pending", " Waiting for bank review ")).toEqual({ status: "pending", reason: "Waiting for bank review" });
  });
  test("can cancel a transaction with its reason", () => {
    expect(validateReview("cancelled", "Incorrect bank details")).toEqual({ status: "cancelled", reason: "Incorrect bank details" });
  });
  test("can confirm a transaction with its reason", () => {
    expect(validateReview("confirmed", " Approved by administrator ")).toEqual({ status: "confirmed", reason: "Approved by administrator" });
  });
  test("requires a reason for confirmation", () => { expect(() => validateReview("confirmed", " ")).toThrow(); });
  test("rejects unknown statuses", () => { expect(() => validateReview("paid", "Reviewed")).toThrow(); });
  test("confirmed requests retain reserved availability without changing stored balance", () => {
    expect(availableForWithdrawal(100, [{ amount: 25.35, status: "confirmed" }])).toBe(74.65);
  });
  test("requires a reason for pending", () => { expect(() => validateReview("pending", " ")).toThrow(); });
  test("requires a reason for cancellation", () => { expect(() => validateReview("cancelled", "")).toThrow(); });
  test("pending requests reserve availability without changing the stored balance", () => {
    const balance = 100;
    expect(availableForWithdrawal(balance, [{ amount: 25.35, status: "pending" }])).toBe(74.65);
    expect(balance).toBe(100);
  });
  test("cancelled requests release reserved availability", () => {
    expect(availableForWithdrawal(100, [{ amount: 25.35, status: "cancelled" }])).toBe(100);
  });
});