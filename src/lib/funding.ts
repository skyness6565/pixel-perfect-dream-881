export function parseFundingAmount(input: string): number {
  const value = input.trim().replace(/^\$/, "");
  if (!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value)) {
    throw new Error("Enter a valid amount with at most two decimal places");
  }
  const amount = Number(value.replaceAll(",", ""));
  if (!Number.isFinite(amount) || amount === 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error("Enter a valid non-zero amount");
  }
  return amount;
}

export async function saveFunding(
  adjust: (id: string, amount: number) => PromiseLike<{ data: number | null; error: { message: string } | null }>,
  id: string,
  input: string,
): Promise<number> {
  const { data, error } = await adjust(id, parseFundingAmount(input));
  if (error) throw new Error(error.message);
  if (data === null || !Number.isFinite(data)) throw new Error("Could not confirm the saved balance");
  return data;
}