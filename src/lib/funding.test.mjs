import { describe, expect, test } from "bun:test";
import { parseFundingAmount, saveFunding } from "./funding.ts";

describe("exact account funding", () => {
  test("accepts the exact dollars and cents entered, including grouped amounts", () => {
    expect(parseFundingAmount("1,250.45")).toBe(1250.45);
    expect(parseFundingAmount("0.10")).toBe(0.1);
  });
  test("rejects fractional cents rather than silently changing the amount", () => {
    expect(() => parseFundingAmount("100.001")).toThrow();
  });
  test("shows the confirmed stored balance, not a calculation from a stale user row", async () => {
    expect(await saveFunding(async (id, amount) => {
      expect(id).toBe("target-user");
      expect(amount).toBe(25.35);
      return { data: 425.45, error: null };
    }, "target-user", "25.35")).toBe(425.45);
  });
  test("does not claim success when the update fails or returns no balance", async () => {
    await expect(saveFunding(async () => ({ data: null, error: { message: "Forbidden" } }), "user", "10")).rejects.toThrow("Forbidden");
    await expect(saveFunding(async () => ({ data: null, error: null }), "user", "10")).rejects.toThrow("confirm");
  });
});