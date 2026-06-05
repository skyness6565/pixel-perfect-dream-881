import {
  createContext,
  useContext,
  useEffect,
  useState,
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
  const [kycStatus, setKycStatus] =
    useState<AuthContextValue["kycStatus"]>("none");
  const [mfaChecked, setMfaChecked] = useState(false);
  const [mfaSatisfied, setMfaSatisfied] = useState(false);

  // Determine whether the current session has completed 2FA (assurance aal2).
  async function checkMfa(hasSession: boolean) {
    if (!hasSession) {
      setMfaSatisfied(false);
      setMfaChecked(true);
      return;
    }
    setMfaChecked(false);
    try {
      const { data } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setMfaSatisfied(data?.currentLevel === "aal2");
    } catch {
      setMfaSatisfied(false);
    } finally {
      setMfaChecked(true);
    }
  }

  async function loadUserMeta(uid: string | undefined) {
    if (!uid) {
      setIsAdmin(false);
      setKycStatus("none");
      setBlocked(false);
      setBlockReason(null);
      setBalance(0);
      setMetaLoading(false);
      return;
    }
    setMetaLoading(true);
    try {
      const [{ data: roles }, { data: kyc }, { data: profile }] = await Promise.all([
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
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setBlocked(!!profile?.blocked);
      setBlockReason((profile?.block_reason as string | null) ?? null);
      setBalance(Number(profile?.balance ?? 0));
      if (kyc && kyc.length > 0) {
        setKycStatus(kyc[0].status as AuthContextValue["kycStatus"]);
      } else {
        setKycStatus("none");
      }
    } finally {
      setMetaLoading(false);
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
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
      // defer supabase calls out of the callback
      setTimeout(() => loadUserMeta(newSession?.user?.id), 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);


  async function signOut() {
    await supabase.auth.signOut();
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
        kycStatus,
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
