import { Ban, Mail } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const SUPPORT_EMAIL = "support@georgestrait-fanclub.com";

export function BlockedNotice({ reason }: { reason?: string | null }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="flex min-h-[70vh] items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl border-2 border-red-500/60 bg-red-500/5 p-10 text-center">
          <Ban className="mx-auto h-16 w-16 text-red-600" />
          <h1 className="mt-6 font-display text-4xl font-extrabold uppercase tracking-tight text-red-600 md:text-5xl">
            This account has been blocked
          </h1>
          {reason && (
            <div className="mx-auto mt-6 max-w-xl border border-red-500/40 bg-background/60 p-5 text-left">
              <p className="font-heading text-xs font-bold uppercase tracking-widest text-red-600">
                Reason
              </p>
              <p className="mt-2 text-base font-medium text-foreground">{reason}</p>
            </div>
          )}
          <p className="mt-6 text-lg font-semibold text-foreground">
            Please reach out to us through email.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 bg-red-600 px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700"
          >
            <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
          </a>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
