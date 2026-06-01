import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/kyc")({
  head: () => ({ meta: [{ title: "Identity Verification (KYC) — George Strait" }] }),
  component: KycPage,
});

function KycPage() {
  const router = useRouter();
  const { session, loading, kycStatus, user, refresh } = useAuth();
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  // Build & clean up object-URL previews
  useEffect(() => {
    if (!front) {
      setFrontPreview(null);
      return;
    }
    const url = URL.createObjectURL(front);
    setFrontPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [front]);

  useEffect(() => {
    if (!back) {
      setBackPreview(null);
      return;
    }
    const url = URL.createObjectURL(back);
    setBackPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [back]);

  function pickFile(setter: (f: File | null) => void, file: File | null) {
    if (file && !file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 10MB.");
      return;
    }
    setter(file);
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!front || !back) {
      toast.error("Please upload both the front and back of your ID.");
      return;
    }
    const uid = user!.id;
    setBusy(true);
    try {
      const stamp = Date.now();
      const frontPath = `${uid}/front-${stamp}-${front.name}`;
      const backPath = `${uid}/back-${stamp}-${back.name}`;

      const up1 = await supabase.storage.from("kyc-documents").upload(frontPath, front, { upsert: false });
      if (up1.error) throw up1.error;
      const up2 = await supabase.storage.from("kyc-documents").upload(backPath, back, { upsert: false });
      if (up2.error) throw up2.error;

      const { error } = await supabase.from("kyc_submissions").insert({
        user_id: uid,
        front_path: frontPath,
        back_path: backPath,
      });
      if (error) throw error;

      toast.success("ID submitted! Your verification is now pending admin approval.");
      await refresh();
      setFront(null);
      setBack(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
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

  const statusView = {
    pending: { Icon: Clock, title: "Verification pending", text: "Your ID has been submitted and is awaiting admin approval. You'll be able to withdraw once approved." },
    approved: { Icon: CheckCircle2, title: "Verified!", text: "Your identity is verified. You can now withdraw funds." },
    rejected: { Icon: XCircle, title: "Verification rejected", text: "Your previous submission was rejected. Please re-submit clear photos of your ID below." },
    none: null,
  }[kycStatus];

  const showForm = kycStatus === "none" || kycStatus === "rejected";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative h-[30vh] min-h-[220px] w-full overflow-hidden">
        <img src="https://georgestrait.com/media/2407/gs_news.jpg?anchor=center&mode=crop&width=1600&height=900" alt="George Strait" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-xl px-6">
          <h1 className="font-display text-5xl text-foreground">IDENTITY VERIFICATION</h1>
          <p className="mt-3 text-muted-foreground">
            Upload clear photos of the front and back of your government-issued ID. Withdrawals are locked until an admin approves your verification.
          </p>

          {statusView && kycStatus !== "rejected" && (
            <div className="mt-8 flex items-start gap-4 border border-border bg-secondary p-6">
              <statusView.Icon className="mt-0.5 h-7 w-7 shrink-0 text-primary" />
              <div>
                <h2 className="font-display text-2xl text-foreground">{statusView.title}</h2>
                <p className="mt-2 text-muted-foreground">{statusView.text}</p>
                {kycStatus === "approved" && (
                  <Link to="/withdraw" className="mt-4 inline-flex items-center bg-foreground px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-primary">
                    Go to withdrawals
                  </Link>
                )}
              </div>
            </div>
          )}

          {kycStatus === "rejected" && statusView && (
            <div className="mt-8 flex items-start gap-4 border border-red-500/40 bg-red-500/10 p-6">
              <statusView.Icon className="mt-0.5 h-7 w-7 shrink-0 text-red-600" />
              <div>
                <h2 className="font-display text-2xl text-foreground">{statusView.title}</h2>
                <p className="mt-2 text-muted-foreground">{statusView.text}</p>
              </div>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {[
                { label: "ID Front", file: front, set: setFront, id: "front" },
                { label: "ID Back", file: back, set: setBack, id: "back" },
              ].map((f) => (
                <div key={f.id}>
                  <label className="block font-heading text-sm font-semibold text-foreground">{f.label} *</label>
                  <label htmlFor={f.id} className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-input bg-background px-4 py-6 text-muted-foreground transition-colors hover:border-primary">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">{f.file ? f.file.name : `Choose ${f.label.toLowerCase()} image`}</span>
                  </label>
                  <input id={f.id} type="file" accept="image/*" className="hidden" onChange={(e) => f.set(e.target.files?.[0] ?? null)} />
                </div>
              ))}

              <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-8 py-3 font-heading text-sm font-semibold uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit for verification
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
