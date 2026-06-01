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
  isAdmin: boolean;
  blocked: boolean;
  balance: number;
  kycStatus: "none" | "pending" | "approved" | "rejected";
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [balance, setBalance] = useState(0);
  const [kycStatus, setKycStatus] =
    useState<AuthContextValue["kycStatus"]>("none");

  async function loadUserMeta(uid: string | undefined) {
    if (!uid) {
      setIsAdmin(false);
      setKycStatus("none");
      setBlocked(false);
      setBalance(0);
      return;
    }
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
        .select("balance, blocked")
        .eq("id", uid)
        .maybeSingle(),
    ]);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    setBlocked(!!profile?.blocked);
    setBalance(Number(profile?.balance ?? 0));
    if (kyc && kyc.length > 0) {
      setKycStatus(kyc[0].status as AuthContextValue["kycStatus"]);
    } else {
      setKycStatus("none");
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
      loadUserMeta(data.session?.user?.id).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
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
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isAdmin,
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
