import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck, Loader2, CheckCircle2, XCircle, Clock, CalendarDays, Eye, ArrowLeft,
  Users, Wallet, Ban, ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — George Strait" }] }),
  component: AdminPage,
});

type Profile = { id: string; email: string | null; full_name: string | null; balance: number; blocked: boolean };
type Kyc = {
  id: string;
  user_id: string;
  front_path: string;
  back_path: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};
type Appointment = {
  id: string;
  user_id: string;
  full_name: string;
  age: number | null;
  phone: string | null;
  country: string | null;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  status: string;
  created_at: string;
};

function AdminPage() {
  const router = useRouter();
  const { session, loading, isAdmin, user } = useAuth();
  const [tab, setTab] = useState<"kyc" | "appointments" | "users">("kyc");
  const [kyc, setKyc] = useState<Kyc[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [users, setUsers] = useState<Profile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    const [{ data: kycData }, { data: apptData }, { data: profData }] = await Promise.all([
      supabase.from("kyc_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("appointments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, email, full_name, balance, blocked"),
    ]);
    setKyc((kycData ?? []) as Kyc[]);
    setAppointments((apptData ?? []) as Appointment[]);
    const list = (profData ?? []) as Profile[];
    const map: Record<string, Profile> = {};
    list.forEach((p) => (map[p.id] = p));
    setProfiles(map);
    setUsers(list);
    setDataLoading(false);
  }, []);


  useEffect(() => {
    if (!loading && !session) {
      router.navigate({ to: "/auth" });
    } else if (!loading && session && isAdmin) {
      loadData();
    }
  }, [loading, session, isAdmin, router, loadData]);

  async function viewDocument(path: string) {
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(path, 60 * 5);
    if (error || !data?.signedUrl) {
      toast.error("Could not open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function reviewKyc(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    const { error } = await supabase
      .from("kyc_submissions")
      .update({ status, reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`KYC ${status}`);
      setKyc((prev) => prev.map((k) => (k.id === id ? { ...k, status } : k)));
    }
    setBusyId(null);
  }

  async function updateAppointment(id: string, status: string) {
    setBusyId(id);
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Appointment marked ${status}`);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    }
    setBusyId(null);
  }

  async function fundUser(u: Profile) {
    const input = window.prompt(
      `Add funds to ${u.full_name || u.email || "user"} (current balance $${Number(u.balance).toFixed(2)}).\nEnter amount to add (use a negative number to deduct):`,
      "100",
    );
    if (input === null) return;
    const amount = Number(input);
    if (!Number.isFinite(amount) || amount === 0) {
      toast.error("Enter a valid non-zero amount");
      return;
    }
    const newBalance = Math.max(0, Number(u.balance) + amount);
    setBusyId(u.id);
    const { error } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", u.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Balance updated to $${newBalance.toFixed(2)}`);
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, balance: newBalance } : p)));
    }
    setBusyId(null);
  }

  async function toggleBlock(u: Profile) {
    const next = !u.blocked;
    setBusyId(u.id);
    const { error } = await supabase
      .from("profiles")
      .update({ blocked: next })
      .eq("id", u.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(next ? "Account blocked" : "Account unblocked");
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, blocked: next } : p)));
    }
    setBusyId(null);
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>
        <SiteFooter />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <ShieldCheck className="h-12 w-12 text-muted-foreground" />
          <h1 className="font-display text-3xl text-foreground">Admins only</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
          <Link to="/account" className="inline-flex items-center gap-2 border border-border px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" /> Back to account
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; Icon: typeof Clock }> = {
      pending: { cls: "bg-yellow-500/15 text-yellow-700", Icon: Clock },
      approved: { cls: "bg-green-500/15 text-green-700", Icon: CheckCircle2 },
      rejected: { cls: "bg-red-500/15 text-red-700", Icon: XCircle },
      requested: { cls: "bg-blue-500/15 text-blue-700", Icon: Clock },
    };
    const b = map[status] ?? map.requested;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${b.cls}`}>
        <b.Icon className="h-3.5 w-3.5" /> {status}
      </span>
    );
  };

  const userLabel = (uid: string) => {
    const p = profiles[uid];
    return p?.full_name || p?.email || uid.slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative h-[24vh] min-h-[180px] w-full overflow-hidden">
        <img src="https://georgestrait.com/media/2407/gs_news.jpg?anchor=center&mode=crop&width=1600&height=900" alt="George Strait" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl text-foreground md:text-5xl">ADMIN DASHBOARD</h1>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-2 border-b border-border">
            {([
              { key: "kyc", label: `KYC Submissions (${kyc.length})` },
              { key: "appointments", label: `Appointments (${appointments.length})` },
              { key: "users", label: `Users (${users.length})` },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-3 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
                  tab === t.key
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {dataLoading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : tab === "kyc" ? (
            <div className="mt-8 space-y-4">
              {kyc.length === 0 && <p className="text-muted-foreground">No KYC submissions yet.</p>}
              {kyc.map((k) => (
                <div key={k.id} className="flex flex-col gap-4 border border-border bg-secondary p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-heading text-base font-bold text-foreground">{userLabel(k.user_id)}</p>
                    <p className="text-sm text-muted-foreground">{profiles[k.user_id]?.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(k.created_at).toLocaleString()}</p>
                    <div className="mt-2">{statusBadge(k.status)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => viewDocument(k.front_path)} className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-background">
                      <Eye className="h-4 w-4" /> Front
                    </button>
                    <button onClick={() => viewDocument(k.back_path)} className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-background">
                      <Eye className="h-4 w-4" /> Back
                    </button>
                    {k.status !== "approved" && (
                      <button disabled={busyId === k.id} onClick={() => reviewKyc(k.id, "approved")} className="inline-flex items-center gap-1.5 bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                        {busyId === k.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve
                      </button>
                    )}
                    {k.status !== "rejected" && (
                      <button disabled={busyId === k.id} onClick={() => reviewKyc(k.id, "rejected")} className="inline-flex items-center gap-1.5 border border-red-500 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/10 disabled:opacity-60">
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "appointments" ? (
            <div className="mt-8 space-y-4">
              {appointments.length === 0 && <p className="text-muted-foreground">No appointments yet.</p>}
              {appointments.map((a) => (
                <div key={a.id} className="border border-border bg-secondary p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <p className="font-heading text-base font-bold text-foreground">{a.full_name}</p>
                    </div>
                    {statusBadge(a.status)}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="text-foreground">Date:</span> {a.appointment_date} at {a.appointment_time}</p>
                    <p><span className="text-foreground">Age:</span> {a.age ?? "—"}</p>
                    <p><span className="text-foreground">Phone:</span> {a.phone ?? "—"}</p>
                    <p><span className="text-foreground">Country:</span> {a.country ?? "—"}</p>
                  </div>
                  {a.notes && <p className="mt-2 text-sm text-muted-foreground"><span className="text-foreground">Notes:</span> {a.notes}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">Account: {profiles[a.user_id]?.email ?? a.user_id.slice(0, 8)}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <span className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">Set status:</span>
                    {(["pending", "approved", "completed", "cancelled"] as const).map((s) => (
                      <button
                        key={s}
                        disabled={busyId === a.id || a.status === s}
                        onClick={() => updateAppointment(a.id, s)}
                        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold capitalize transition-colors disabled:cursor-not-allowed ${
                          a.status === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-foreground hover:bg-background"
                        }`}
                      >
                        {busyId === a.id && a.status !== s ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {users.length === 0 && <p className="text-muted-foreground">No users yet.</p>}
              {users.map((u) => (
                <div key={u.id} className={`flex flex-col gap-4 border p-5 md:flex-row md:items-center md:justify-between ${u.blocked ? "border-red-500/60 bg-red-500/5" : "border-border bg-secondary"}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-heading text-base font-bold text-foreground">{u.full_name || u.email || u.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Wallet className="h-4 w-4 text-primary" /> ${Number(u.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {u.blocked && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700">
                            <Ban className="h-3.5 w-3.5" /> Blocked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      disabled={busyId === u.id}
                      onClick={() => fundUser(u)}
                      className="inline-flex items-center gap-1.5 bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {busyId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />} Fund
                    </button>
                    <button
                      disabled={busyId === u.id}
                      onClick={() => toggleBlock(u)}
                      className={`inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-semibold disabled:opacity-60 ${
                        u.blocked
                          ? "border-border text-foreground hover:bg-background"
                          : "border-red-500 text-red-600 hover:bg-red-500/10"
                      }`}
                    >
                      {u.blocked ? <><ShieldOff className="h-4 w-4" /> Unblock</> : <><Ban className="h-4 w-4" /> Block</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
