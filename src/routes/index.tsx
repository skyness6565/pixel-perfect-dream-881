import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero-strait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "George Strait — The King of Country" },
      {
        name: "description",
        content:
          "Official home of George Strait. News, shows, the music, store, fan club and galleries from the King of Country.",
      },
      { property: "og:title", content: "George Strait — The King of Country" },
      {
        property: "og:description",
        content:
          "News, tour dates, music and more from country legend George Strait.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div id="home" className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="George Strait performing live in a black cowboy hat with an acoustic guitar"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Logo lockup, right side */}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center lg:flex lg:right-20">
          <div className="relative flex items-center justify-center">
            <Star
              className="h-44 w-44 fill-accent text-accent xl:h-56 xl:w-56"
              strokeWidth={0.5}
            />
            <span className="absolute font-display text-7xl text-foreground xl:text-8xl">
              SG
            </span>
          </div>
          <h1 className="mt-2 text-center font-display text-6xl leading-[0.85] text-foreground xl:text-7xl">
            GEORGE
            <br />
            STRAIT
          </h1>
        </div>
      </section>

      {/* Intro strip */}
      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            The King of Country
          </p>
          <h2 className="mt-4 font-display text-4xl text-foreground md:text-5xl">
            Sixty #1 Hits. One Legend.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            For over four decades George Strait has defined country music with a
            steady stream of chart-topping singles, sold-out tours, and an
            unmistakable Texas sound. Explore the music, catch a show, and join
            the fan club.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
