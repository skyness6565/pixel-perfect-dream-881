import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const MEDIA = "https://georgestrait.com/media";
const BANNER = `${MEDIA}/2407/gs_news.jpg?anchor=center&mode=crop&width=1600&height=900`;
const ALBUM_COVER = `${MEDIA}/2947/george-strait-cowboys-and-dreamers.jpg?width=600&height=600`;
const LISTEN_URL = "https://strm.to/cowboysanddreamerswe";

export const Route = createFileRoute("/fan-club")({
  head: () => ({
    meta: [
      { title: "Fan Club Registration — George Strait" },
      {
        name: "description",
        content:
          "Join the FREE George Strait Fan Club. Get notified of upcoming specials and early access to presale tickets.",
      },
      { property: "og:title", content: "Fan Club Registration — George Strait" },
      {
        property: "og:description",
        content:
          "Join the FREE George Strait Fan Club for upcoming specials and presale ticket access.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: BANNER },
    ],
  }),
  component: FanClubPage,
});

const LATEST_NEWS = [
  {
    title:
      "GEORGE STRAIT AND VAQUEROS DEL MAR'S \u201CSTRAIT TO THE HEART\u201D RAISES $6.25 MILLION AND COUNTING FOR HILL COUNTRY FLOOD RELIEF",
    date: "28 Jul 2025",
  },
  {
    title:
      "GEORGE STRAIT AND VAQUEROS DEL MAR ANNOUNCE \u201CSTRAIT TO THE HEART\u201D - A BENEFIT FOR HILL COUNTRY FLOOD VICTIMS",
    date: "11 Jul 2025",
  },
  {
    title:
      "GEORGE STRAIT AND CHRIS STAPLETON EXTEND RUN OF STADIUM SHOWS FOR 2025",
    date: "12 Feb 2025",
  },
];

type Field = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
};

const FIELDS: Field[] = [
  { name: "firstName", label: "First Name", required: true, placeholder: "First Name" },
  { name: "lastName", label: "Last Name", required: true, placeholder: "Last Name" },
  { name: "address", label: "Address", required: true, placeholder: "Address" },
  { name: "city", label: "City", required: true, placeholder: "City" },
  { name: "state", label: "State / Province", placeholder: "State / Province" },
  { name: "zip", label: "Zip Code", required: true, placeholder: "Zip Code" },
  { name: "country", label: "Country", required: true, placeholder: "Country" },
  { name: "phone", label: "Phone Number", type: "tel", placeholder: "Phone Number" },
  { name: "email", label: "Email", required: true, type: "email", placeholder: "Email Address" },
  { name: "password", label: "Password", required: true, type: "password", placeholder: "Password" },
];

function FanClubPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero banner */}
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
        <img
          src={BANNER}
          alt="George Strait"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
      </section>

      {/* Body: main + sidebar */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div>
            <h1 className="font-display text-5xl text-foreground md:text-6xl">
              FAN CLUB REGISTRATION
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-foreground">
              Welcome to the FREE George Strait Fan Club Membership!
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Please fill out the form below to join the free George Strait Fan
              Club. As a fan club member, you will be notified of upcoming
              specials and have early access to presale tickets.
            </p>

            {submitted ? (
              <div className="mt-10 flex items-start gap-4 border border-border bg-secondary p-8">
                <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-primary" />
                <div>
                  <h2 className="font-display text-2xl text-foreground">
                    Submitted!
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Thank you for joining the George Strait Fan Club. Your
                    registration has been received.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-5 inline-flex items-center bg-foreground px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-primary"
                  >
                    Register another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 max-w-xl space-y-6">
                {FIELDS.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="block font-heading text-base font-semibold text-foreground"
                    >
                      {field.label}{" "}
                      {field.required && <span className="text-primary">*</span>}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type ?? "text"}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  className="inline-flex items-center bg-foreground px-8 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-background transition-colors hover:bg-primary"
                >
                  Submit
                </button>
              </form>
            )}

            {/* Fan club address */}
            <div className="mt-16 border-t border-border pt-8">
              <h3 className="font-heading text-lg font-bold text-foreground">
                George Strait Fan Club
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                P.O. Box 210098
                <br />
                Nashville, TN. 37221
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Latest news */}
            <div className="bg-secondary p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-base font-bold uppercase tracking-widest text-foreground">
                  Latest News
                </h3>
                <a href="/news" className="text-sm text-primary hover:underline">
                  See all
                </a>
              </div>
              <ul className="mt-5 divide-y divide-border">
                {LATEST_NEWS.map((item) => (
                  <li key={item.title} className="py-4 first:pt-0">
                    <a href="/news" className="group block">
                      <p className="font-heading text-sm font-bold uppercase leading-snug text-foreground group-hover:text-primary">
                        {item.title}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.date}
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
                  src={ALBUM_COVER}
                  alt="George Strait — Cowboys and Dreamers"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <a
                href={LISTEN_URL}
                target="_blank"
                rel="noopener noreferrer"
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
