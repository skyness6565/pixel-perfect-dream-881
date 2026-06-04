// Lightweight client-side performance logging.
//
// Tracks three things and logs them to the browser console:
//   1. Button / link clicks  -> how long until the next paint (UI responsiveness)
//   2. Network requests       -> exact API/route timing (Supabase + server fns)
//   3. Route navigations      -> time from click to the route fully resolving
//
// Anything slower than the thresholds below is logged as a warning so the
// root cause (a slow API call, a heavy route, etc.) is easy to spot.

const SLOW_CLICK_MS = 100; // a click should feel instant
const SLOW_REQUEST_MS = 400; // network round-trips slower than this are flagged
const SLOW_NAV_MS = 300; // route transitions slower than this are flagged

type Severity = "ok" | "slow";

function emit(kind: string, label: string, ms: number, severity: Severity) {
  const rounded = Math.round(ms);
  const tag = `%c[perf] ${kind}`;
  const style =
    severity === "slow"
      ? "color:#fff;background:#dc2626;padding:1px 4px;border-radius:3px"
      : "color:#fff;background:#16a34a;padding:1px 4px;border-radius:3px";
  const msg = `${label} — ${rounded}ms`;
  if (severity === "slow") {
    console.warn(tag, style, msg);
  } else {
    console.info(tag, style, msg);
  }
}

function shortLabel(el: Element | null): string {
  if (!el) return "unknown";
  const aria = el.getAttribute("aria-label");
  const text = (aria || el.textContent || "").replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 48) : el.tagName.toLowerCase();
}

let initialized = false;

/**
 * Patches fetch + adds a click listener. Safe to call multiple times; only the
 * first call wires anything up. No-op during SSR.
 */
export function initPerfLogging() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  // 1. Time clicks on interactive elements until the next painted frame.
  document.addEventListener(
    "click",
    (e) => {
      const target = (e.target as HTMLElement | null)?.closest(
        "button, a, [role='button'], [data-perf]",
      );
      if (!target) return;
      const label = shortLabel(target);
      const start = performance.now();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const ms = performance.now() - start;
          emit("click", label, ms, ms > SLOW_CLICK_MS ? "slow" : "ok");
        }),
      );
    },
    true,
  );

  // 2. Time every network request (Supabase REST/RPC, auth, server fns).
  const origFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const input = args[0];
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    // Trim to a readable path (drop origin + query for log brevity).
    let label = rawUrl;
    try {
      const u = new URL(rawUrl, window.location.origin);
      label = u.pathname;
    } catch {
      /* keep rawUrl */
    }
    const start = performance.now();
    try {
      const res = await origFetch(...args);
      const ms = performance.now() - start;
      emit(
        res.ok ? "api" : `api ${res.status}`,
        label,
        ms,
        ms > SLOW_REQUEST_MS ? "slow" : "ok",
      );
      return res;
    } catch (err) {
      const ms = performance.now() - start;
      emit("api:error", label, ms, "slow");
      throw err;
    }
  };
}

/**
 * Subscribes to router events to log how long each navigation takes
 * (click/link -> route fully resolved). Returns an unsubscribe function.
 */
export function trackRouterPerf(router: {
  subscribe: (event: string, cb: (e: unknown) => void) => () => void;
  state: { location: { pathname: string } };
}) {
  if (typeof window === "undefined") return () => {};
  let navStart = 0;
  let pending = "";

  const offStart = router.subscribe("onBeforeNavigate", (e: any) => {
    navStart = performance.now();
    pending = e?.toLocation?.pathname ?? router.state.location.pathname;
  });
  const offEnd = router.subscribe("onResolved", () => {
    if (!navStart) return;
    const ms = performance.now() - navStart;
    emit("route", pending || router.state.location.pathname, ms, ms > SLOW_NAV_MS ? "slow" : "ok");
    navStart = 0;
  });

  return () => {
    offStart();
    offEnd();
  };
}
