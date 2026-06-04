import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, ShieldCheck, Banknote, LogOut, Clock, XCircle, CheckCircle2, CheckCheck, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlockedNotice } from "@/components/blocked-notice";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — George Strait" }] }),
  component: AccountPage,
});

type Appointment = {
  id: string;
  full_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
};

const APPT_STATUS: Record<string, { label: string; cls: string; Icon: typeof Clock }> = {
  pending: { label: "Pending", cls: "bg-yellow-500/15 text-yellow-700", Icon: Clock },
  approved: { label: "Approved", cls: "bg-blue-500/15 text-blue-700", Icon: CheckCircle2 },
  completed: { label: "Completed", cls: "bg-green-500/15 text-green-700", Icon: CheckCheck },
  cancelled: { label: "Cancelled", cls: "bg-red-500/15 text-red-700", Icon: XCircle },
};

function AccountPage() {
  const router = useRouter();
  const { session, loading, kycStatus, blocked, blockReason, balance, user, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  useEffect(() => {
    if (!session || !user) return;
    let active = true;
    supabase
      .from("appointments")
      .select("id, full_name, appointment_date, appointment_time, status, created_at")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: true })
      .then(({ data }) => {
        if (active) {
          setAppointments((data ?? []) as Appointment[]);
          setApptLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [session, user]);

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

  if (blocked) {
    return <BlockedNotice reason={blockReason} />;
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

          <div className="mt-8 flex items-center gap-4 border border-border bg-secondary p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Account Balance
              </p>
              <p className="font-display text-3xl text-foreground">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
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
          </div>

          {/* My appointments */}
          <div className="mt-14">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-foreground">MY APPOINTMENTS</h2>
              <Link to="/book-appointment" className="text-sm font-semibold text-primary hover:underline">
                Book new
              </Link>
            </div>

            {apptLoading ? (
              <p className="mt-6 text-muted-foreground">Loading your appointments…</p>
            ) : appointments.length === 0 ? (
              <p className="mt-6 text-muted-foreground">
                You haven't booked any appointments yet.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {appointments.map((a) => {
                  const badge = APPT_STATUS[a.status] ?? APPT_STATUS.pending;
                  return (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 border border-border bg-secondary p-5"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-heading text-base font-bold text-foreground">
                            {new Date(a.appointment_date).toLocaleDateString(undefined, {
                              weekday: "short", year: "numeric", month: "short", day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">{a.appointment_time}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${badge.cls}`}>
                        <badge.Icon className="h-4 w-4" /> {badge.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
