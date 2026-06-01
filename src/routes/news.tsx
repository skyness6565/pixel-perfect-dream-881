import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero-strait.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News — George Strait" },
      {
        name: "description",
        content:
          "Read the latest news first from George Strait's organization and MCA-Nashville. Official press releases posted in chronological order.",
      },
      { property: "og:title", content: "News — George Strait" },
      {
        property: "og:description",
        content:
          "Official press releases and the latest news from country legend George Strait.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: NewsPage,
});

type Article = {
  title: string;
  subtitle?: string;
  body?: string[];
  date: string;
  categories: string[];
  comments?: string;
  image: string;
};

const ARTICLES: Article[] = [
  {
    title:
      "GEORGE STRAIT AND VAQUEROS DEL MAR'S \u201CSTRAIT TO THE HEART\u201D RAISES $6.25 MILLION AND COUNTING FOR HILL COUNTRY FLOOD RELIEF",
    body: [
      "William Beckmann, Ray Benson, Wade Bowen, Dean Dillon, Riley Green, Randy Houser, Jamey Johnson, Kyle Park, Hudson Westbrook & Surprise Guest Garth Brooks Joined Strait and Members of his Ace in the Hole Band",
      "Evening Included Prayer Led by Pastor Max Lucado and Remarks from Governor Greg Abbott",
    ],
    date: "28 Jul 2025",
    categories: ["Touring"],
    comments: "0 comments",
    image: heroImg,
  },
  {
    title:
      "GEORGE STRAIT AND VAQUEROS DEL MAR ANNOUNCE \u201CSTRAIT TO THE HEART\u201D - A BENEFIT FOR HILL COUNTRY FLOOD VICTIMS",
    subtitle: "Intimate Donor Dinner & Concert Sunday, July 27",
    body: [
      "William Beckman, Ray Benson, Wade Bowen, Dean Dillon, Riley Green, Randy Houser, Jamey Johnson, Kyle Park and Hudson Westbrook Join Strait and Members of his Ace in the Hole Band for Concert",
      "Proceeds Directly Benefit Flood Victims",
    ],
    date: "11 Jul 2025",
    categories: ["Touring"],
    image: heroImg,
  },
  {
    title:
      "GEORGE STRAIT AND CHRIS STAPLETON EXTEND RUN OF STADIUM SHOWS FOR 2025",
    subtitle:
      "Special Guest Parker McCollum Joins for Philadelphia, Pittsburgh, Buffalo and Foxborough and Little Big Town Joins for Inglewood",
    body: ["Tickets on Sale Friday, Feb. 21 at 10 a.m. Local Time via GeorgeStrait.com"],
    date: "12 Feb 2025",
    categories: ["Touring", "Albums & Music"],
    image: heroImg,
  },
  {
    title:
      "COUNTRY MUSIC ICON GEORGE STRAIT TO RECEIVE THE 2024 CMA WILLIE NELSON LIFETIME ACHIEVEMENT AWARD AT \u201CTHE 58TH ANNUAL CMA AWARDS\u201D",
    subtitle:
      "Country Music's Biggest Night\u2122 to Broadcast Live from Nashville Wednesday, Nov. 20 at 8/7c on ABC",
    date: "12 Nov 2024",
    categories: ["Albums & Music", "Awards"],
    image: heroImg,
  },
  {
    title: "GEORGE STRAIT'S COWBOYS AND DREAMERS ARRIVES",
    subtitle:
      "The King of Country Music's 31st Studio Album for MCA is Associated Press' Album of the Week",
    date: "06 Sep 2024",
    categories: ["Albums & Music"],
    image: heroImg,
  },
  {
    title:
      "GEORGE STRAIT, THE KING AT KYLE FIELD BECOMES LARGEST SINGLE CONCERT IN U.S. HISTORY W/ 110,905",
    subtitle:
      "Strait Also Holds the Record for Largest Indoor Concert in North America with 104,793 Fans at AT&T Stadium for The Cowboy Rides Away Tour in June 2014",
    date: "15 Jun 2024",
    categories: ["Touring", "Albums & Music"],
    image: heroImg,
  },
  {
    title:
      "GEORGE STRAIT ANNOUNCES TO INDY CROWD: \u201CI BROKE DOWN AND DID ANOTHER RECORD\u201D",
    subtitle: "STRAIT'S 31st STUDIO RECORD FOR MCA: COWBOYS AND DREAMERS",
    body: [
      "1st of Only 10 Shows in 2024 Sees Sellout at Lucas Oil Stadium w/ 51,132 Packing Out the Home of Indianapolis Colts",
    ],
    date: "06 May 2024",
    categories: ["Albums & Music", "Touring"],
    image: heroImg,
  },
  {
    title:
      "GEORGE STRAIT'S 'THE KING AT KYLE FIELD' ON TRACK TO SURPASS 2014 AT&T ATTENDANCE RECORD",
    subtitle:
      "June 15 Show Boasts over 100K Fans Holding Tickets-and-Counting for Only Texas Date + Only Show In-The-Round",
    date: "11 Apr 2024",
    categories: ["Touring", "Albums & Music"],
    image: heroImg,
  },
];

const YEARS = [
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
];

const CATEGORIES = [
  "Touring",
  "Albums & Music",
  "Team Roping",
  "Awards",
  "Fan Club",
  "Family",
  "Sponsorship",
];

function PostMeta({ article }: { article: Article }) {
  return (
    <div className="mt-6 flex flex-col gap-3 bg-secondary px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Posted by{" "}
        <span className="inline-flex items-center gap-1 text-primary">
          The George Strait Team <ExternalLink className="h-3.5 w-3.5" />
        </span>{" "}
        on {article.date}
      </p>
      <p className="text-primary">
        {article.comments ?? article.categories.join(", ")}
      </p>
    </div>
  );
}

function NewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero banner */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="George Strait waving to the crowd"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
      </section>

      {/* Body: main + sidebar */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div>
            <h1 className="font-display text-5xl text-foreground md:text-6xl">
              NEWS
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Read the latest news here first from George Strait's organization
              and MCA-Nashville. All official press releases will be posted in
              chronological order below.
            </p>

            <div className="mt-10 space-y-14">
              {ARTICLES.map((article) => (
                <article key={article.title}>
                  <div className="overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="aspect-[16/9] w-full object-cover object-top"
                    />
                  </div>
                  <h2 className="mt-6 font-display text-2xl uppercase leading-tight text-foreground md:text-3xl">
                    {article.title}
                  </h2>
                  {article.subtitle && (
                    <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                      {article.subtitle}
                    </p>
                  )}
                  {article.body?.map((para) => (
                    <p
                      key={para}
                      className="mt-3 text-lg leading-relaxed text-muted-foreground"
                    >
                      {para}
                    </p>
                  ))}
                  <PostMeta article={article} />
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* All posts */}
            <div className="bg-secondary p-6">
              <h3 className="font-heading text-base font-bold uppercase tracking-widest text-primary">
                All Posts
              </h3>
              <ul className="mt-5 space-y-4">
                {YEARS.map((year) => (
                  <li key={year}>
                    <a
                      href="#"
                      className="text-primary transition-colors hover:text-foreground"
                    >
                      {year}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="bg-secondary p-6">
              <h3 className="font-heading text-base font-bold uppercase tracking-widest text-foreground">
                Categories
              </h3>
              <ul className="mt-5 space-y-4">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <a
                      href="#"
                      className="text-primary transition-colors hover:text-foreground"
                    >
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Latest news */}
            <div className="bg-secondary p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold uppercase tracking-widest text-foreground">
                  Latest News
                </h3>
                <a href="#" className="text-sm text-primary hover:underline">
                  See all
                </a>
              </div>
              <ul className="mt-5 divide-y divide-border">
                {ARTICLES.slice(0, 4).map((article) => (
                  <li key={article.title} className="py-4 first:pt-0">
                    <a href="#" className="group block">
                      <p className="font-heading text-sm font-bold uppercase leading-snug text-foreground group-hover:text-primary">
                        {article.title}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {article.date}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Album promo */}
            <div className="bg-foreground p-5 text-background">
              <div className="overflow-hidden">
                <img
                  src={heroImg}
                  alt="George Strait — Cowboys and Dreamers"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <p className="mt-4 font-display text-xl">Cowboys and Dreamers</p>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-2 border border-background px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-background hover:text-foreground"
              >
                Listen Now <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
