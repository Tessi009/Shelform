"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  business_id: string;
  role: "owner" | "admin" | "user";
  full_name: string;
  email: string;
  profile_image_url: string | null;
  phone: string | null;
  language: string;
  onboarding_completed: boolean;
  settings: Record<string, unknown>;
}

interface Business {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  currency: string;
  language: string;
  timezone: string;
  tax_rate: number;
  address: string | null;
  phone: string | null;
  vat_number: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  business: Business | null;
  loading: boolean;
  signUp: (params: {
    email: string;
    password: string;
    businessName: string;
    fullName: string;
  }) => Promise<{ error?: string }>;
  signIn: (params: {
    email: string;
    password: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateBusiness: (updates: Partial<Business>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null);
  if (supabaseRef.current === null) supabaseRef.current = createSupabaseBrowserClient();
  const supabase = supabaseRef.current;
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (prof) {
      setProfile(prof as Profile);

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", prof.business_id)
        .single();

      if (biz) setBusiness(biz as Business);
    }
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch {
        // Auth fetch errors are handled gracefully
      } finally {
        setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await fetchProfile(session.user.id);
        } catch {
          // Auth fetch errors are handled gracefully
        }
      } else {
        setProfile(null);
        setBusiness(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signUp = async ({
    email,
    password,
    businessName,
    fullName,
  }: {
    email: string;
    password: string;
    businessName: string;
    fullName: string;
  }) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, businessName, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || "Signup failed" };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        return { error: "Account created. Please sign in." };
      }

      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  };

  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setBusiness(null);
    router.push("/");
  };

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    await supabase.from("profiles").update(updates).eq("id", user.id);
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business) return;
    await supabase.from("businesses").update(updates).eq("id", business.id);
    setBusiness((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        business,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
        updateBusiness,
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
