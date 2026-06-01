import { Facebook, Twitter, Instagram, Youtube, Music2 } from "lucide-react";

const COL_ONE = ["Home", "About George", "News", "Store", "Fan Club"];
const COL_TWO = ["Shows", "Strait Talk", "The Music", "Galleries"];

const SOCIALS = [
  { Icon: Facebook, label: "Facebook", bg: "bg-[#3b5998]" },
  { Icon: Twitter, label: "Twitter", bg: "bg-[#1da1f2]" },
  { Icon: Music2, label: "TikTok", bg: "bg-foreground text-background" },
  { Icon: Instagram, label: "Instagram", bg: "bg-[#444]" },
  { Icon: Youtube, label: "YouTube", bg: "bg-[#e1573f]" },
];

export function SiteFooter() {
  return (
    <footer className="bg-background py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 text-center md:grid-cols-3">
        <ul className="space-y-3">
          {COL_ONE.map((item) => (
            <li key={item}>
              <a
                href="#home"
                className="font-heading text-base text-foreground/90 transition-colors hover:text-primary"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <ul className="space-y-3">
          {COL_TWO.map((item) => (
            <li key={item}>
              <a
                href="#home"
                className="font-heading text-base text-foreground/90 transition-colors hover:text-primary"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div>
          <h3 className="mb-5 font-heading text-lg font-semibold uppercase tracking-widest text-foreground">
            Social
          </h3>
          <div className="flex justify-center gap-3">
            {SOCIALS.map(({ Icon, label, bg }) => (
              <a
                key={label}
                href="#home"
                aria-label={label}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-primary-foreground transition-transform hover:scale-110 ${bg}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-14 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} George Strait. All rights reserved.
      </p>
    </footer>
  );
}
