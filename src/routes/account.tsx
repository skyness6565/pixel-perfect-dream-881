import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, ShieldCheck, Banknote, LogOut, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — George Strait" }] }),
  component: AccountPage,
});

function AccountPage() {
  const router = useRouter();
  const { session, loading, isAdmin, kycStatus, user, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          Loading…
        </div>
        <SiteFooter />
      </div>
    );
  }

  const kycBadge = {
    none: { label: "Not started", cls: "bg-secondary text-muted-foreground", Icon: Clock },
    pending: { label: "Pending review", cls: "bg-yellow-500/15 text-yellow-700", Icon: Clock },
    approved: { label: "Approved", cls: "bg-green-500/15 text-green-700", Icon: CheckCircle2 },
    rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-700", Icon: XCircle },
  }[kycStatus];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative h-[30vh] min-h-[220px] w-full overflow-hidden">
        <img
          src="https://georgestrait.com/media/2407/gs_news.jpg?anchor=center&mode=crop&width=1600&height=900"
          alt="George Strait"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-5xl text-foreground">MY ACCOUNT</h1>
              <p className="mt-2 text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={async () => {
                await signOut();
                router.navigate({ to: "/auth" });
              }}
              className="inline-flex items-center gap-2 border border-border px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
              KYC Status:
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${kycBadge.cls}`}>
              <kycBadge.Icon className="h-4 w-4" /> {kycBadge.label}
            </span>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/book-appointment" className="group border border-border bg-secondary p-6 transition-colors hover:border-primary">
              <CalendarDays className="h-8 w-8 text-primary" />
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">Book Appointment</h2>
              <p className="mt-1 text-sm text-muted-foreground">Schedule a meeting and pick a time.</p>
            </Link>
            <Link to="/kyc" className="group border border-border bg-secondary p-6 transition-colors hover:border-primary">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">Identity Verification</h2>
              <p className="mt-1 text-sm text-muted-foreground">Submit your ID to unlock withdrawals.</p>
            </Link>
            <Link to="/withdraw" className="group border border-border bg-secondary p-6 transition-colors hover:border-primary">
              <Banknote className="h-8 w-8 text-primary" />
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">Withdraw Funds</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {kycStatus === "approved" ? "Request a payout to your bank." : "Requires approved KYC."}
              </p>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="group border border-primary bg-foreground p-6 text-background transition-opacity hover:opacity-90">
                <ShieldCheck className="h-8 w-8" />
                <h2 className="mt-4 font-heading text-lg font-bold">Admin Dashboard</h2>
                <p className="mt-1 text-sm opacity-80">Review KYC and appointments.</p>
              </Link>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
