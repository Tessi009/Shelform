"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/auth/language-selector";
import { useLanguage } from "@/contexts/language-context";

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/[0.03] to-background">
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
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-3xl font-bold tracking-tight">{t.common.appName}</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            {t.welcome.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.welcome.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 text-base">
              {t.welcome.getStarted}
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
            >
              {t.welcome.signIn}
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t.common.appName}. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
