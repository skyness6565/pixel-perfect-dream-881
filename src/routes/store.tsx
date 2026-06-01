import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getNairaToUsdRate } from "@/lib/exchange.functions";

import capRoadsign from "@/assets/store/cap-roadsign.jpg";
import totePhoto from "@/assets/store/tote-photo.jpg";
import tumblerBlue from "@/assets/store/tumbler-blue.jpg";
import teeTroubadourBlack from "@/assets/store/tee-troubadour-black.jpg";
import teeTroubadourBlue from "@/assets/store/tee-troubadour-blue.jpg";
import glassOldfashion from "@/assets/store/glass-oldfashion.jpg";
import glassShot from "@/assets/store/glass-shot.jpg";
import photo8x10 from "@/assets/store/photo-8x10.jpg";
import jacketSatin from "@/assets/store/jacket-satin.jpg";
import hoodieSandstone from "@/assets/store/hoodie-sandstone.jpg";
import teeLongsleeve from "@/assets/store/tee-longsleeve.jpg";
import hoodieZipBlack from "@/assets/store/hoodie-zip-black.jpg";
import beanieCharcoal from "@/assets/store/beanie-charcoal.jpg";
import teeAmarillo from "@/assets/store/tee-amarillo.jpg";
import teeWine from "@/assets/store/tee-wine.jpg";
import capLivn from "@/assets/store/cap-livn.jpg";
import teeTexas from "@/assets/store/tee-texas.jpg";
import capStoneRope from "@/assets/store/cap-stone-rope.jpg";
import capBlackRope from "@/assets/store/cap-black-rope.jpg";
import capBlackCamo from "@/assets/store/cap-black-camo.jpg";
import keychain from "@/assets/store/keychain.jpg";
import calendar from "@/assets/store/calendar.jpg";
import vinyl from "@/assets/store/vinyl.jpg";
import capClemson from "@/assets/store/cap-clemson.jpg";
import hoodieNavy from "@/assets/store/hoodie-navy.jpg";
import teeTourPhoto from "@/assets/store/tee-tour-photo.jpg";
import teeTourSpring from "@/assets/store/tee-tour-spring.jpg";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Store — George Strait" },
      {
        name: "description",
        content:
          "Shop official George Strait merchandise — tees, outerwear, hats, accessories, music and Troubadour collection. Prices shown in USD.",
      },
      { property: "og:title", content: "Store — George Strait" },
      {
        property: "og:description",
        content: "Official George Strait merchandise. Prices shown in USD.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: StorePage,
});

type Category =
  | "Tees"
  | "Outerwear"
  | "Hats"
  | "Accessories"
  | "Music"
  | "Troubadour";

type Product = {
  title: string;
  image: string;
  /** Base price in Nigerian Naira (converted to USD at runtime). */
  ngn: number;
  /** Original/compare-at price in Naira, if on sale. */
  ngnCompareAt?: number;
  from?: boolean;
  soldOut?: boolean;
  sale?: boolean;
  badge?: string;
  category: Category;
};

const PRODUCTS: Product[] = [
  { title: "Clemson Event Ballcap- LIMITED EDITION", image: capClemson, ngn: 49977.99, category: "Hats", badge: "LIMITED" },
  { title: "George Strait Navy Pullover Hoodie", image: hoodieNavy, ngn: 92816.27, category: "Outerwear" },
  { title: "George Strait 2026 Black Photo Tour Tee", image: teeTourPhoto, ngn: 49977.99, category: "Tees" },
  { title: "George Strait 2026 Black Spring Tour Tee", image: teeTourSpring, ngn: 49977.99, category: "Tees" },
  { title: "George Strait Somewhere in Texas Tee", image: teeTexas, ngn: 49977.99, category: "Tees" },
  { title: "Stone and Black Mesh Rope Ballcap- PRE ORDER", image: capStoneRope, ngn: 42838.28, category: "Hats" },
  { title: "Black Rope Ballcap- PRE ORDER", image: capBlackRope, ngn: 42838.28, category: "Hats" },
  { title: "George Strait Black Camo Ballcap", image: capBlackCamo, ngn: 42838.28, category: "Hats", soldOut: true },
  { title: "George Strait 2026 8x10", image: photo8x10, ngn: 7139.71, category: "Accessories", soldOut: true },
  { title: "Die Cut Keychain", image: keychain, ngn: 17135.31, category: "Accessories" },
  { title: "George Strait Official 2026 Calendar", image: calendar, ngn: 14279.43, ngnCompareAt: 28558.85, sale: true, category: "Accessories" },
  { title: "George Strait Double Vinyl - Cowboys and Dreamers", image: vinyl, ngn: 49977.99, category: "Music", soldOut: true },
  { title: "George Strait Black Road Sign Ballcap", image: capRoadsign, ngn: 42838.28, category: "Hats", soldOut: true },
  { title: "George Strait Photo Tote Bag", image: totePhoto, ngn: 35698.57, category: "Accessories" },
  { title: "George Strait Blue 20 oz Tumbler", image: tumblerBlue, ngn: 28558.85, ngnCompareAt: 35698.57, category: "Accessories", soldOut: true },
  { title: "George Strait 8x10", image: photo8x10, ngn: 7139.71, category: "Accessories", soldOut: true },
  { title: "George Strait Troubadour Black Tee", image: teeTroubadourBlack, ngn: 35698.57, from: true, category: "Troubadour" },
  { title: "George Strait Ladies Heather Lagoon Blue Troubadour Tee", image: teeTroubadourBlue, ngn: 35698.57, from: true, category: "Troubadour" },
  { title: "George Strait Troubadour Old Fashion Glass", image: glassOldfashion, ngn: 21419.14, category: "Troubadour" },
  { title: "George Strait Frosted Troubadour Shotglass", image: glassShot, ngn: 14279.43, category: "Troubadour" },
  { title: "George Strait Satin Jacket", image: jacketSatin, ngn: 278448.81, category: "Outerwear", soldOut: true },
  { title: "George Strait Sandstone Hoodie", image: hoodieSandstone, ngn: 92816.27, category: "Outerwear" },
  { title: "George Strait Long Sleeve Troubadour Tee", image: teeLongsleeve, ngn: 57117.7, from: true, category: "Troubadour" },
  { title: "George Strait Zip Up Black Hoodie", image: hoodieZipBlack, ngn: 64257.42, ngnCompareAt: 85676.56, category: "Outerwear", soldOut: true },
  { title: "George Strait Heather Charcoal Troubadour Beanie", image: beanieCharcoal, ngn: 42838.28, category: "Troubadour" },
  { title: "George Strait Amarillo By Morning Tee", image: teeAmarillo, ngn: 49977.99, category: "Tees" },
  { title: "George Strait Wine Write This Down Tee", image: teeWine, ngn: 49977.99, category: "Tees" },
  { title: "George Strait Grey LIVN Ballcap", image: capLivn, ngn: 42838.28, category: "Hats" },
];

const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Tees",
  "Outerwear",
  "Hats",
  "Accessories",
  "Music",
  "Troubadour",
];

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function StorePage() {
  const fetchRate = useServerFn(getNairaToUsdRate);
  const { data: rate } = useQuery({
    queryKey: ["ngn-usd-rate"],
    queryFn: () => fetchRate(),
    staleTime: 1000 * 60 * 10,
  });

  const usdPerNgn = rate?.usdPerNgn ?? 1 / 1427.94;
  const toUsd = (ngn: number) => usdFormatter.format(ngn * usdPerNgn);

  const [active, setActive] = useState<"All" | Category>("All");

  const products = useMemo(
    () =>
      active === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === active),
    [active],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero banner so the overlay header stays legible */}
      <section className="relative flex h-[38vh] min-h-[260px] items-end overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/40" />
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pb-10 lg:px-10">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-background/70">
            Official Merchandise
          </p>
          <h1 className="mt-2 font-display text-5xl uppercase tracking-tight text-background lg:text-7xl">
            Store
          </h1>
          <p className="mt-3 max-w-xl font-body text-sm text-background/70">
            Prices are converted live to US Dollars using the CoinGecko
            exchange-rate API
            {rate ? (
              <>
                {" "}
                · rate source:{" "}
                <span className="uppercase">{rate.source}</span>
              </>
            ) : (
              " · loading rate…"
            )}
          </p>
        </div>
      </section>

      {/* Category filter bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <nav className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 lg:px-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
                active === cat
                  ? "text-primary"
                  : "text-foreground/70 hover:text-primary"
              }`}
            >
              {cat === "All" ? "All Products" : cat}
            </button>
          ))}
          <Link
            to="/"
            className="ml-auto font-heading text-sm font-semibold uppercase tracking-wide text-foreground/70 transition-colors hover:text-primary"
          >
            Back to georgestrait.com
          </Link>
        </nav>
      </div>

      {/* Product grid */}
      <main className="mx-auto max-w-[1600px] px-5 py-10 lg:px-10 lg:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <article key={p.title} className="group flex flex-col">
              <div className="relative mb-4 aspect-square overflow-hidden bg-card">
                <img
                  src={p.image}
                  alt={p.title}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {p.sale && (
                  <span className="absolute left-3 top-3 bg-primary px-2 py-1 font-heading text-xs font-bold uppercase tracking-wide text-primary-foreground">
                    Sale
                  </span>
                )}
                {p.badge && !p.sale && (
                  <span className="absolute left-3 top-3 bg-accent px-2 py-1 font-heading text-xs font-bold uppercase tracking-wide text-accent-foreground">
                    {p.badge}
                  </span>
                )}
              </div>

              <h2 className="font-heading text-base font-semibold leading-snug text-foreground">
                {p.title}
              </h2>

              <div className="mt-1 flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-primary">
                  {p.from ? "from " : ""}
                  {toUsd(p.ngn)}
                </span>
                {p.ngnCompareAt && (
                  <span className="font-heading text-sm font-medium text-primary/60 line-through">
                    {toUsd(p.ngnCompareAt)}
                  </span>
                )}
              </div>

              {p.soldOut && (
                <span className="mt-2 inline-block w-fit border border-foreground/40 px-2 py-0.5 font-heading text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  Sold Out
                </span>
              )}
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
