"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Building2, Globe, DollarSign, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/auth/language-selector";

const steps = [
  { key: "business", icon: Building2 },
  { key: "language", icon: Globe },
  { key: "currency", icon: DollarSign },
  { key: "ready", icon: Rocket },
];

const currencies = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "ALL", label: "Albanian Lek", symbol: "L" },
  { code: "CHF", label: "Swiss Franc", symbol: "Fr" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const { business, updateBusiness, profile, updateProfile } = useAuth();
  const { t, lang } = useLanguage();
  const router = useRouter();

  const handleFinish = async () => {
    setSaving(true);

    if (business) {
      await updateBusiness({
        name: businessName || business.name,
        language: lang,
        currency: selectedCurrency,
      });
    }

    if (profile) {
      await updateProfile({
        language: lang,
        onboarding_completed: true,
      });
    }

    setSaving(false);
    router.push("/dashboard");
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return businessName.length > 0;
      case 1:
        return true;
      case 2:
        return selectedCurrency.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/[0.03] to-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    i <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-12 sm:w-16 transition-colors ${
                      i < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">
                    {t.onboarding.step1Title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t.onboarding.step1Desc}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t.settings.businessName}
                  </label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Corp"
                    className="h-11"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="language"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">
                    {t.onboarding.step2Title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t.onboarding.step2Desc}
                  </p>
                </div>
                <div className="flex justify-center">
                  <LanguageSelector />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="currency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">
                    {t.onboarding.step3Title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t.onboarding.step3Desc}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCurrency(c.code)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted ${
                        selectedCurrency === c.code
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-input"
                      }`}
                    >
                      <span className="text-base">{c.symbol}</span>
                      <div>
                        <p className="font-medium">{c.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 text-center"
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                  <Rocket className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-xl font-bold">
                  {t.onboarding.step5Title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t.onboarding.finishMessage}
                </p>
                <div className="rounded-lg bg-muted p-4 text-left text-sm space-y-2">
                  <p>
                    <span className="font-medium">Business:</span>{" "}
                    {businessName}
                  </p>
                  <p>
                    <span className="font-medium">Language:</span>{" "}
                    {lang === "en" ? "English" : "Shqip"}
                  </p>
                  <p>
                    <span className="font-medium">Currency:</span>{" "}
                    {selectedCurrency}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              {t.common.back}
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                {t.common.next}
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? t.common.saving : t.common.finish}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
