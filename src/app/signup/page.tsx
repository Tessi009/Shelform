"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/auth/language-selector";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function SignUpPage() {
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await signUp({ email, password, businessName, fullName });
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/[0.03] to-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-10">
        <LanguageSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <span className="text-xl font-bold text-primary-foreground">S</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t.auth.signUpTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.auth.signUpSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.auth.businessName}
              </label>
              <Input
                placeholder="Acme Corp"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.auth.fullName}
              </label>
              <Input
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.auth.email}</label>
              <Input
                type="email"
                placeholder="john@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t.auth.password}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-11"
              disabled={submitting}
            >
              {submitting ? t.common.loading : t.welcome.getStarted}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.auth.hasAccount}{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              {t.auth.signInLink}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
