import { createServerFn } from "@tanstack/react-start";

// Fetches the live NGN -> USD exchange rate using the CoinGecko API.
// We read the price of Tether (a USD-pegged stablecoin, ~$1) in both USD and
// NGN, which lets us derive how many Naira make up one US Dollar:
//   ngnPerUsd = tether.ngn / tether.usd
// Prices stored in Naira can then be converted with:  usd = ngn / ngnPerUsd
export const getNairaToUsdRate = createServerFn({ method: "GET" }).handler(
  async () => {
    const fallbackNgnPerUsd = 1427.94; // sane default if the API is unreachable

    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd,ngn",
        { headers: { accept: "application/json" } },
      );

      if (!res.ok) {
        throw new Error(`CoinGecko responded with ${res.status}`);
      }

      const data = (await res.json()) as {
        tether?: { usd?: number; ngn?: number };
      };

      const usd = data.tether?.usd;
      const ngn = data.tether?.ngn;

      if (!usd || !ngn) {
        throw new Error("CoinGecko returned an unexpected payload");
      }

      const ngnPerUsd = ngn / usd;

      return {
        ngnPerUsd,
        usdPerNgn: 1 / ngnPerUsd,
        source: "coingecko" as const,
        fetchedAt: new Date().toISOString(),
      };
    } catch {
      return {
        ngnPerUsd: fallbackNgnPerUsd,
        usdPerNgn: 1 / fallbackNgnPerUsd,
        source: "fallback" as const,
        fetchedAt: new Date().toISOString(),
      };
    }
  },
);
