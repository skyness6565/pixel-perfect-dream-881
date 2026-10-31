import { describe, expect, test } from "bun:test";
import { validateReview } from "./transactions.ts";

describe("administrator transaction reviews", () => {
  test("can mark a transaction pending with its reason", () => {
    expect(validateReview("pending", " Waiting for bank review ")).toEqual({ status: "pending", reason: "Waiting for bank review" });
  });
  test("can cancel a transaction with its reason", () => {
    expect(validateReview("cancelled", "Incorrect bank details")).toEqual({ status: "cancelled", reason: "Incorrect bank details" });
  });
  test("requires a reason for pending", () => { expect(() => validateReview("pending", " ")).toThrow(); });
  test("requires a reason for cancellation", () => { expect(() => validateReview("cancelled", "")).toThrow(); });
});