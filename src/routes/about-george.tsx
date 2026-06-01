import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about-george")({
  head: () => ({
    meta: [
      { title: "About George — George Strait" },
      {
        name: "description",
        content:
          "Find out what motivates this country music superstar after decades of number one hits. Meet the King of Country and the team behind him.",
      },
      { property: "og:title", content: "About George — George Strait" },
      {
        property: "og:description",
        content:
          "Get behind the scenes and meet George Strait, the undeniable King of Country Music.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutGeorge,
});

const SUB_LINKS = [
  "George's Biography",
  "Strait Facts",
  "Discography",
  "Awards",
  "Sponsors",
];

function AboutGeorge() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Page hero banner */}
      <section className="relative h-[42vh] min-h-[300px] w-full overflow-hidden">
        <img
          src="https://georgestrait.com/media/2406/gs_meetgeorge.jpg?anchor=center&mode=crop&width=1600&height=550"
          alt="George Strait"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-6 pb-8">
          <h1 className="font-display text-5xl text-white md:text-6xl">
            About George
          </h1>
        </div>
      </section>

      {/* Intro copy */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl space-y-5 px-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Find out what motivates this country music superstar after decades
            of number one hits.
          </p>
          <p>
            Get behind the scenes and meet the team of people who support George
            on the road and help manage the busy day-to-day responsibilities of
            one of the largest fan clubs in country music.
          </p>
          <p>
            If you want to find out your best source of George Strait trivia
            answers, check out the Strait Facts section.
          </p>
          <p>
            The Discography option includes a timeline of George and his music
            categorized by albums and singles.
          </p>
          <p>
            Keep up with the many accolades awarded to George throughout the
            years in the Awards section.
          </p>
          <p>
            All this and more information is being provided to you — just click
            on any of the options below and enjoy.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {SUB_LINKS.map((label) => (
              <span
                key={label}
                className="rounded-full border border-border bg-card px-5 py-2 font-heading text-sm font-medium uppercase tracking-wide text-foreground/90"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Biography */}
      <section className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            George's Biography
          </p>
          <h2 className="mt-4 font-display text-3xl text-foreground md:text-4xl">
            The King of Country Music
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              Some might say the beauty of George Strait is you know what you're
              going to get — straight ahead country music. But the real beauty of
              George Strait is his innate ability to collide comfortable &amp;
              worn with fresh &amp; exciting every time he straps on his guitar
              and steps up to the microphone.
            </p>
            <p>
              George Strait is the undeniable "King of Country Music." His music
              career spans more than 30 years; includes 60 No. 1 singles, more
              than any other artist in any genre; and boasts 33 platinum or
              multi-platinum-selling albums, more than any country artist and
              third across all genres behind only The Beatles and Elvis Presley.
              Strait is the only act in history to have a Top 10 hit every year
              for over three decades and has sold more than 70 million albums and
              earned more than 60 major entertainment industry awards.
            </p>
            <p>
              Strait, whose name has become synonymous with "real country" since
              his 1981 debut, was inducted into the Country Music Hall of Fame in
              2006. He has since released five more albums, including the GRAMMY
              Award-winning <em>Troubadour</em> and his chart-topping release{" "}
              <em>Cold Beer Conversation</em>.
            </p>
            <p>
              In 2014, he shattered the North American indoor concert attendance
              record by drawing 104,793 concert-goers to his{" "}
              <em>The Cowboy Rides Away Tour</em> finale at AT&amp;T Stadium in
              Dallas.
            </p>
          </div>

          <div className="pt-10">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
