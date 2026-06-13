import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlockedNotice } from "@/components/blocked-notice";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const MEDIA = "https://georgestrait.com/media";
const BANNER = `${MEDIA}/2407/gs_news.jpg?anchor=center&mode=crop&width=1600&height=900`;

export const Route = createFileRoute("/book-appointment")({
  head: () => ({
    meta: [
      { title: "Book an Appointment — George Strait" },
      {
        name: "description",
        content:
          "Schedule an appointment with the George Strait team. Pick your date, time, and share your details.",
      },
    ],
  }),
  component: BookAppointmentPage,
});

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Ireland", "Australia",
  "New Zealand", "Germany", "France", "Spain", "Italy", "Netherlands",
  "Sweden", "Norway", "Mexico", "Brazil", "Argentina", "Japan", "Other",
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

function BookAppointmentPage() {
  const router = useRouter();
  const { session, loading, blocked, blockReason, user, mfaChecked, mfaSatisfied } = useAuth();
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!session || (mfaChecked && !mfaSatisfied)) {
      router.navigate({ to: "/auth" });
    }
  }, [loading, session, mfaChecked, mfaSatisfied, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName || !date || !time) {
      toast.error("Please fill in your name, date and time.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        user_id: user!.id,
        full_name: fullName,
        age: age ? Number(age) : null,
        phone: phone || null,
        country: country || null,
        appointment_date: date,
        appointment_time: time,
        notes: notes || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Appointment requested!");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not book appointment");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !session || !mfaChecked || !mfaSatisfied) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>
        <SiteFooter />
      </div>
    );
  }

  if (blocked) {
    return <BlockedNotice reason={blockReason} />;
  }



  const inputCls =
    "mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";
  const labelCls = "block font-heading text-base font-semibold text-foreground";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <img src={BANNER} alt="George Strait" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-9 w-9 text-primary" />
            <h1 className="font-display text-3xl text-foreground sm:text-5xl md:text-6xl">BOOK APPOINTMENT</h1>
          </div>

          {submitted ? (
            <div className="mt-10 flex items-start gap-4 border border-border bg-secondary p-8">
              <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-primary" />
              <div>
                <h2 className="font-display text-2xl text-foreground">Appointment requested!</h2>
                <p className="mt-2 text-muted-foreground">
                  Thanks {fullName}. Your appointment for {date} at {time} has been submitted and is awaiting confirmation.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFullName(""); setAge(""); setPhone(""); setCountry("");
                      setDate(""); setTime(""); setNotes("");
                    }}
                    className="inline-flex items-center bg-foreground px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-primary"
                  >
                    Book another
                  </button>
                  <Link to="/account" className="inline-flex items-center border border-border px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary">
                    Back to account
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label htmlFor="fullName" className={labelCls}>Full Name <span className="text-primary">*</span></label>
                <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className={inputCls} />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="age" className={labelCls}>Age</label>
                  <input id="age" type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelCls}>Phone</label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className={inputCls} />
                </div>
              </div>

              <div>
                <label htmlFor="country" className={labelCls}>Country</label>
                <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className={labelCls}>Date <span className="text-primary">*</span></label>
                  <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="time" className={labelCls}>Time <span className="text-primary">*</span></label>
                  <select id="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputCls}>
                    <option value="" disabled>Select a time</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className={labelCls}>Additional Notes</label>
                <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else we should know?" className={inputCls} />
              </div>

              <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-8 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Request Appointment
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
