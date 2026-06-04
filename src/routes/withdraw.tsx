import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { CheckCircle2, ExternalLink, Banknote, ShieldCheck, ShieldAlert, Clock, Printer, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlockedNotice } from "@/components/blocked-notice";
import { useAuth } from "@/lib/auth";

const MEDIA = "https://georgestrait.com/media";
const BANNER = `${MEDIA}/2407/gs_news.jpg?anchor=center&mode=crop&width=1600&height=900`;
const ALBUM_COVER = `${MEDIA}/2947/george-strait-cowboys-and-dreamers.jpg?width=600&height=600`;
const LISTEN_URL = "https://strm.to/cowboysanddreamerswe";
const PORTRAIT = `${MEDIA}/2407/gs_news.jpg?anchor=center&mode=crop&width=900&height=900`;

type Receipt = {
  reference: string;
  date: Date;
  amount: string;
  accountHolder: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  email: string;
};

function maskAccount(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `${"•".repeat(Math.min(digits.length - 4, 8))}${digits.slice(-4)}`;
}

function genReference() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString().slice(-6);
  return `GS-${stamp}-${rand}`;
}



export const Route = createFileRoute("/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw Funds — George Strait" },
      {
        name: "description",
        content:
          "Securely withdraw your funds to any US bank account. Enter your bank and account details to request a payout.",
      },
      { property: "og:title", content: "Withdraw Funds — George Strait" },
      {
        property: "og:description",
        content:
          "Securely withdraw your funds to any US bank account in just a few steps.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: BANNER },
    ],
  }),
  component: WithdrawPage,
});

const US_BANKS = [
  "JPMorgan Chase Bank",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "U.S. Bank",
  "PNC Bank",
  "Truist Bank",
  "Capital One",
  "TD Bank",
  "Goldman Sachs Bank (Marcus)",
  "American Express National Bank",
  "Ally Bank",
  "Citizens Bank",
  "Fifth Third Bank",
  "KeyBank",
  "Regions Bank",
  "Huntington National Bank",
  "M&T Bank",
  "Discover Bank",
  "Navy Federal Credit Union",
  "USAA Federal Savings Bank",
  "Charles Schwab Bank",
  "Other",
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const LATEST_NEWS = [
  {
    title:
      "GEORGE STRAIT AND VAQUEROS DEL MAR'S \u201CSTRAIT TO THE HEART\u201D RAISES $6.25 MILLION AND COUNTING FOR HILL COUNTRY FLOOD RELIEF",
    date: "28 Jul 2025",
  },
  {
    title:
      "GEORGE STRAIT AND CHRIS STAPLETON EXTEND RUN OF STADIUM SHOWS FOR 2025",
    date: "12 Feb 2025",
  },
];

const AVAILABLE_BALANCE = 1250.0;

function WithdrawPage() {
  const router = useRouter();
  const { session, loading, kycStatus, blocked, blockReason } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (name: string) => String(data.get(name) ?? "").trim();
    setReceipt({
      reference: genReference(),
      date: new Date(),
      amount: get("amount") || amount,
      accountHolder: get("accountHolder"),
      bankName: get("bankName"),
      accountType: get("accountType"),
      accountNumber: get("accountNumber"),
      routingNumber: get("routingNumber"),
      email: get("email"),
    });
    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function resetForm() {
    setSubmitted(false);
    setReceipt(null);
    setAmount("");
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

  if (blocked) {
    return <BlockedNotice reason={blockReason} />;
  }



  // Block withdrawals until KYC is approved
  if (kycStatus !== "approved") {
    const pending = kycStatus === "pending";
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
          <img src={BANNER} alt="George Strait" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-6">
            <div className="flex items-start gap-4 border border-border bg-secondary p-8">
              {pending ? (
                <Clock className="mt-0.5 h-8 w-8 shrink-0 text-yellow-600" />
              ) : (
                <ShieldAlert className="mt-0.5 h-8 w-8 shrink-0 text-primary" />
              )}
              <div>
                <h1 className="font-display text-3xl text-foreground">
                  {pending ? "Verification pending" : "Verify your identity first"}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {pending
                    ? "Your ID is being reviewed by our team. Withdrawals will unlock as soon as an admin approves your verification."
                    : "Withdrawals are locked until your identity verification (KYC) has been approved. Please submit your ID to continue."}
                </p>
                {!pending && (
                  <Link to="/kyc" className="mt-5 inline-flex items-center gap-2 bg-foreground px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-primary">
                    <ShieldCheck className="h-4 w-4" /> Complete verification
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <SiteHeader />

      {/* Hero banner */}
      <section className="relative h-[45vh] min-h-[320px] w-full overflow-hidden">
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
            <div className="flex items-center gap-3">
              <Banknote className="h-9 w-9 text-primary" />
              <h1 className="font-display text-5xl text-foreground md:text-6xl">
                WITHDRAW FUNDS
              </h1>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Transfer your available balance to any United States bank account.
              Enter your banking details below and submit your withdrawal request.
            </p>

            {/* Balance card */}
            <div className="mt-8 flex items-center justify-between border border-border bg-secondary p-6">
              <div>
                <p className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Available Balance
                </p>
                <p className="mt-1 font-display text-4xl text-foreground">
                  ${AVAILABLE_BALANCE.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <span className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                USD
              </span>
            </div>

            {submitted && receipt ? (
              <WithdrawalReceipt receipt={receipt} onReset={resetForm} />
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 max-w-xl space-y-6">
                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    className="block font-heading text-base font-semibold text-foreground"
                  >
                    Withdrawal Amount (USD){" "}
                    <span className="text-primary">*</span>
                  </label>
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      max={AVAILABLE_BALANCE}
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-input bg-background py-3 pl-8 pr-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Account holder */}
                <div>
                  <label
                    htmlFor="accountHolder"
                    className="block font-heading text-base font-semibold text-foreground"
                  >
                    Account Holder Name <span className="text-primary">*</span>
                  </label>
                  <input
                    id="accountHolder"
                    name="accountHolder"
                    type="text"
                    required
                    placeholder="Full name as it appears on the account"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Bank name */}
                <div>
                  <label
                    htmlFor="bankName"
                    className="block font-heading text-base font-semibold text-foreground"
                  >
                    US Bank <span className="text-primary">*</span>
                  </label>
                  <select
                    id="bankName"
                    name="bankName"
                    required
                    defaultValue=""
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Select your bank
                    </option>
                    {US_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account type */}
                <div>
                  <label
                    htmlFor="accountType"
                    className="block font-heading text-base font-semibold text-foreground"
                  >
                    Account Type <span className="text-primary">*</span>
                  </label>
                  <select
                    id="accountType"
                    name="accountType"
                    required
                    defaultValue="Checking"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>

                {/* Routing + Account number */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="routingNumber"
                      className="block font-heading text-base font-semibold text-foreground"
                    >
                      Routing Number <span className="text-primary">*</span>
                    </label>
                    <input
                      id="routingNumber"
                      name="routingNumber"
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="\d{9}"
                      maxLength={9}
                      placeholder="9 digits"
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="accountNumber"
                      className="block font-heading text-base font-semibold text-foreground"
                    >
                      Account Number <span className="text-primary">*</span>
                    </label>
                    <input
                      id="accountNumber"
                      name="accountNumber"
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="\d{4,17}"
                      maxLength={17}
                      placeholder="Account number"
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Billing address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block font-heading text-base font-semibold text-foreground"
                  >
                    Billing Address <span className="text-primary">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    placeholder="Street address"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="city"
                      className="block font-heading text-base font-semibold text-foreground"
                    >
                      City <span className="text-primary">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      placeholder="City"
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block font-heading text-base font-semibold text-foreground"
                    >
                      State <span className="text-primary">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      required
                      defaultValue=""
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="" disabled>
                        State
                      </option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="zip"
                      className="block font-heading text-base font-semibold text-foreground"
                    >
                      Zip Code <span className="text-primary">*</span>
                    </label>
                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      required
                      inputMode="numeric"
                      pattern="\d{5}(-\d{4})?"
                      placeholder="Zip"
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block font-heading text-base font-semibold text-foreground"
                  >
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email Address"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Your banking information is encrypted and processed securely.
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center bg-foreground px-8 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-background transition-colors hover:bg-primary"
                >
                  Withdraw Funds
                </button>
              </form>
            )}
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

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-dashed border-border py-3">
      <span className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-right text-sm font-medium text-foreground ${mono ? "font-mono tracking-wide" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function WithdrawalReceipt({ receipt, onReset }: { receipt: Receipt; onReset: () => void }) {
  const amountNum = Number(receipt.amount) || 0;
  const formattedAmount = amountNum.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const dateStr = receipt.date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mt-10 max-w-xl">
      {/* Confirmation banner */}
      <div className="mb-6 flex items-center gap-3 border border-primary/30 bg-primary/5 px-5 py-4">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          <span className="font-semibold">Withdrawal requested.</span> Funds
          typically arrive in your US bank account within 1–3 business days.
        </p>
      </div>

      {/* Receipt card */}
      <div
        id="withdrawal-receipt"
        className="relative overflow-hidden border border-border bg-card shadow-xl"
      >
        {/* George Strait watermark photo */}
        <img
          src={PORTRAIT}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.06]"
        />
        <div className="pointer-events-none absolute inset-0 select-none">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-24deg] whitespace-nowrap font-display text-6xl uppercase tracking-tight text-foreground/[0.05]">
            George Strait
          </span>
        </div>

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-border bg-foreground px-6 py-5 text-background">
            <div className="flex items-center gap-3">
              <img
                src={PORTRAIT}
                alt="George Strait"
                className="h-12 w-12 rounded-full border-2 border-background/70 object-cover"
              />
              <div>
                <p className="font-display text-xl leading-none">GEORGE STRAIT</p>
                <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-background/70">
                  Withdrawal Receipt
                </p>
              </div>
            </div>
            <Banknote className="h-8 w-8 text-background/80" />
          </div>

          {/* Amount hero */}
          <div className="border-b border-border px-6 py-7 text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Amount Withdrawn
            </p>
            <p className="mt-2 font-display text-5xl text-foreground">
              ${formattedAmount}
            </p>
            <p className="mt-1 font-heading text-xs font-semibold uppercase tracking-widest text-primary">
              USD · Processing
            </p>
          </div>

          {/* Details */}
          <div className="px-6 py-4">
            <ReceiptRow label="Reference" value={receipt.reference} mono />
            <ReceiptRow label="Date" value={dateStr} />
            <ReceiptRow label="Account Holder" value={receipt.accountHolder} />
            <ReceiptRow label="Bank" value={receipt.bankName} />
            <ReceiptRow label="Account Type" value={receipt.accountType} />
            <ReceiptRow
              label="Account No."
              value={maskAccount(receipt.accountNumber)}
              mono
            />
            <ReceiptRow
              label="Routing No."
              value={maskAccount(receipt.routingNumber)}
              mono
            />
            <ReceiptRow label="Email" value={receipt.email} />
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-secondary px-6 py-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              This receipt confirms your withdrawal request was received and is
              being processed securely.
            </div>
            <p className="mt-3 text-center font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Thank you · George Strait Official
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-foreground px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-primary"
        >
          <Printer className="h-4 w-4" /> Print / Save PDF
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 border border-input px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4" /> New withdrawal
        </button>
      </div>
    </div>
  );
}

