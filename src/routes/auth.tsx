import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Copy, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const MEDIA = "https://georgestrait.com/media";
const BANNER = `${MEDIA}/2407/gs_news.jpg?anchor=center&mode=crop&width=1600&height=900`;

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In / Create Account — George Strait" },
      {
        name: "description",
        content:
          "Sign in or create your account to book appointments, complete verification, and manage withdrawals.",
      },
    ],
  }),
  component: AuthPage,
});

const credsSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

type Step = "credentials" | "mfa-enroll" | "mfa-challenge";

function AuthPage() {
  const router = useRouter();
  const { session, loading, refresh, mfaChecked, mfaSatisfied } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<Step>("credentials");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // 2FA state
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  // True while we're transitioning a fresh signup into the 2FA enrollment
  // screen. Blocks the auto-redirect from firing before the QR appears.
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    // Decide where a signed-in user goes based on their 2FA status.
    if (loading || enrolling || busy) return;
    if (!session || step !== "credentials" || !mfaChecked) return;

    if (mfaSatisfied) {
      // 2FA already completed this session — proceed to the account.
      router.navigate({ to: "/account" });
      return;
    }

    // Signed in but 2FA not completed: force enrollment or a challenge
    // before any account/dashboard page can load.
    let cancelled = false;
    setEnrolling(true);
    (async () => {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      const verified = (factors?.totp ?? []).find(
        (f) => f.status === "verified",
      );
      if (verified) {
        setFactorId(verified.id);
        setCode("");
        setStep("mfa-challenge");
        toast.message("Enter the code from your authenticator app.");
      } else {
        toast.message(
          "Set up two-factor authentication to secure your account.",
        );
        await startEnrollment();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session, step, enrolling, busy, mfaChecked, mfaSatisfied, router]);


  function resetMfa() {
    setFactorId(null);
    setQrCode(null);
    setSecret(null);
    setCode("");
    setCopied(false);
  }

  // Remove any half-finished (unverified) TOTP factors so enroll doesn't error.
  async function clearUnverifiedFactors() {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const stale = (data?.all ?? []).filter(
        (f) => f.factor_type === "totp" && f.status !== "verified",
      );
      for (const f of stale) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    } catch {
      /* non-fatal */
    }
  }

  async function startEnrollment() {
    await clearUnverifiedFactors();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${Date.now()}`,
    });
    if (error) throw error;
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStep("mfa-enroll");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = credsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        // Block the auto-redirect: signUp triggers SIGNED_IN, and we must
        // stay on this page to show the 2FA enrollment screen.
        setEnrolling(true);
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) {
          setEnrolling(false);
          throw error;
        }
        if (!data.session) {
          setEnrolling(false);
          toast.success(
            "Account created! Check your email to confirm, then sign in to set up 2FA.",
          );
          setMode("login");
          return;
        }
        toast.success("Account created! Now set up two-factor authentication.");
        await startEnrollment();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;

        // Check this account's existing factors.
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedTotp = (factors?.totp ?? []).find(
          (f) => f.status === "verified",
        );

        if (verifiedTotp) {
          // 2FA already enabled — challenge for the current code.
          setFactorId(verifiedTotp.id);
          setCode("");
          setStep("mfa-challenge");
          toast.message("Enter the code from your authenticator app.");
          return;
        }

        // No verified 2FA (account created before 2FA was enforced).
        // Force enrollment now before letting them into the account.
        setEnrolling(true);
        toast.message("Set up two-factor authentication to secure your account.");
        await startEnrollment();
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      setEnrolling(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;

      toast.success(
        step === "mfa-enroll"
          ? "Two-factor authentication enabled!"
          : "Verified — welcome back!",
      );
      resetMfa();
      setStep("credentials");
      await refresh();
      router.navigate({ to: "/account" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid code";
      toast.error(message);
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  function copySecret() {
    if (!secret) return;
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const heading =
    step === "mfa-enroll"
      ? "SET UP 2FA"
      : step === "mfa-challenge"
        ? "VERIFY 2FA"
        : mode === "login"
          ? "SIGN IN"
          : "CREATE ACCOUNT";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative h-[35vh] min-h-[260px] w-full overflow-hidden">
        <img
          src={BANNER}
          alt="George Strait"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-md px-6">
          <h1 className="font-display text-5xl text-foreground">{heading}</h1>

          {step === "credentials" && (
            <>
              <p className="mt-3 text-muted-foreground">
                {mode === "login"
                  ? "Access your account to book appointments and manage withdrawals."
                  : "Join to book appointments, verify your identity, and withdraw funds. You'll set up an authenticator app next."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {mode === "signup" && (
                  <div>
                    <label className="block font-heading text-sm font-semibold text-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      maxLength={120}
                      placeholder="Your full name"
                      className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
                <div>
                  <label className="block font-heading text-sm font-semibold text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-heading text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="mt-2 w-full border border-input bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-8 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="font-semibold text-primary hover:underline"
                >
                  {mode === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            </>
          )}

          {step === "mfa-enroll" && (
            <>
              <p className="mt-3 text-muted-foreground">
                Scan this QR code with an authenticator app (Google
                Authenticator, Authy, 1Password), then enter the 6-digit code to
                finish.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4">
                {qrCode && (
                  <div className="rounded-lg border border-input bg-white p-4">
                    <img
                      src={qrCode}
                      alt="2FA QR code"
                      className="h-48 w-48"
                    />
                  </div>
                )}
                {secret && (
                  <button
                    type="button"
                    onClick={copySecret}
                    className="inline-flex items-center gap-2 break-all rounded-md border border-input bg-muted px-3 py-2 font-mono text-xs text-foreground transition-colors hover:bg-accent"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {secret}
                  </button>
                )}
              </div>

              <form onSubmit={handleVerify} className="mt-8 space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <label className="font-heading text-sm font-semibold text-foreground">
                    Enter 6-digit code
                  </label>
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-8 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Verify & Enable
                </button>
              </form>
            </>
          )}

          {step === "mfa-challenge" && (
            <>
              <p className="mt-3 text-muted-foreground">
                Enter the 6-digit code from your authenticator app to finish
                signing in.
              </p>

              <form onSubmit={handleVerify} className="mt-8 space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-8 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Verify & Continue
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    resetMfa();
                    setStep("credentials");
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  Cancel
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
