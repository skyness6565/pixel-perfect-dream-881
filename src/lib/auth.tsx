import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  metaLoading: boolean;
  isAdmin: boolean;
  blocked: boolean;
  blockReason: string | null;
  balance: number;
  metaError: string | null;
  kycStatus: "none" | "pending" | "approved" | "rejected";
  // 2FA gate: mfaChecked = we've inspected the session's assurance level;
  // mfaSatisfied = the current session has completed 2FA (aal2).
  mfaChecked: boolean;
  mfaSatisfied: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [metaError, setMetaError] = useState<string | null>(null);
  const metaRequest = useRef(0);
  const [kycStatus, setKycStatus] =
    useState<AuthContextValue["kycStatus"]>("none");
  // 2FA has been removed. These remain `true` so any existing route guards
  // that reference them simply allow access once the user is signed in.
  const mfaChecked = true;
  const mfaSatisfied = true;

  async function loadUserMeta(uid: string | undefined) {
    const request = ++metaRequest.current;
    if (!uid) {
      setIsAdmin(false);
      setKycStatus("none");
      setBlocked(false);
      setBlockReason(null);
      setBalance(0);
      setMetaError(null);
      setMetaLoading(false);
      return;
    }
    setMetaLoading(true);
    try {
      const [rolesResult, kycResult, profileResult] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase
          .from("kyc_submissions")
          .select("status")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("profiles")
          .select("balance, blocked, block_reason")
          .eq("id", uid)
          .maybeSingle(),
      ]);
      if (request !== metaRequest.current) return;
      const error = rolesResult.error ?? kycResult.error ?? profileResult.error;
      if (error || !profileResult.data) throw new Error("Could not load your account details");
      const roles = rolesResult.data;
      const kyc = kycResult.data;
      const profile = profileResult.data;
      setMetaError(null);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setBlocked(!!profile?.blocked);
      setBlockReason((profile?.block_reason as string | null) ?? null);
      setBalance(Number(profile?.balance ?? 0));
      if (kyc && kyc.length > 0) {
        setKycStatus(kyc[0].status as AuthContextValue["kycStatus"]);
      } else {
        setKycStatus("none");
      }
    } catch {
      if (request === metaRequest.current) setMetaError("Balance unavailable");
    } finally {
      if (request === metaRequest.current) setMetaLoading(false);
    }
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadUserMeta(data.session?.user?.id);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      // Session is known — let the app render immediately. Metadata
      // (roles, balance, blocked status) loads in the background.
      setLoading(false);
      loadUserMeta(data.session?.user?.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      // defer supabase calls out of the callback
      setTimeout(() => {
        loadUserMeta(newSession?.user?.id);
      }, 0);
    });

    return () => {
      mounted = false;
      metaRequest.current++;
      subscription.unsubscribe();
    };
  }, []);

  const uid = session?.user.id;
  useEffect(() => {
    if (!uid) return;
    const reload = () => {
      if (document.visibilityState === "visible") void loadUserMeta(uid);
    };
    reload();
    const interval = window.setInterval(reload, 15000);
    window.addEventListener("focus", reload);
    window.addEventListener("popstate", reload);
    document.addEventListener("visibilitychange", reload);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", reload);
      window.removeEventListener("popstate", reload);
      document.removeEventListener("visibilitychange", reload);
    };
  }, [uid]);


  async function signOut() {
    await supabase.auth.signOut();
    metaRequest.current++;
    setSession(null);
    setIsAdmin(false);
    setKycStatus("none");
    setBlocked(false);
    setBlockReason(null);
    setBalance(0);
    setMetaLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        metaLoading,
        isAdmin,
        blocked,
        blockReason,
        balance,
        metaError,
        kycStatus,
        mfaChecked,
        mfaSatisfied,
        refresh,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
