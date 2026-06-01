import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  "Home",
  "About George",
  "News",
  "Store",
  "Fan Club",
  "Shows",
  "The Music",
  "Galleries",
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-background/70 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 lg:px-10">
        <a
          href="#home"
          className="font-display text-2xl tracking-tight text-foreground lg:text-3xl"
        >
          GEORGE STRAIT
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item}
              href="#home"
              className={`relative font-heading text-sm font-medium uppercase tracking-wide transition-colors hover:text-primary ${
                i === 0 ? "text-foreground" : "text-foreground/85"
              }`}
            >
              {item}
              {i === 0 && (
                <span className="absolute -top-[26px] left-1/2 h-1 w-8 -translate-x-1/2 bg-primary" />
              )}
            </a>
          ))}
        </nav>

        <button
          className="text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 pb-4 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#home"
              className="block py-3 font-heading text-sm font-medium uppercase tracking-wide text-foreground/85 hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
