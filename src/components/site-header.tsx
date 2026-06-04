import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS: { label: string; to: string }[] = [
  { label: "Home", to: "/" },
  { label: "About George", to: "/about-george" },
  { label: "News", to: "/news" },
  { label: "Store", to: "/store" },
  { label: "Fan Club", to: "/fan-club" },
  { label: "Book", to: "/book-appointment" },
  { label: "Withdraw", to: "/withdraw" },
  { label: "Account", to: "/account" },
  { label: "Shows", to: "/" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/70 to-transparent">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 lg:px-10">
        <Link
          to="/"
          className="font-display text-2xl tracking-tight text-white lg:text-3xl"
        >
          GEORGE STRAIT
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              preload="intent"
              className="relative font-heading text-sm font-medium uppercase tracking-wide text-white/85 transition-colors hover:text-primary"
              activeProps={{ className: "text-white" }}
              activeOptions={{ exact: true }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 pb-4 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="block py-3 font-heading text-sm font-medium uppercase tracking-wide text-foreground/85 hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
