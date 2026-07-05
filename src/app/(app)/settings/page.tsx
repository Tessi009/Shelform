"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Loader2 } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSelector } from "@/components/auth/language-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/shared/image-upload";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { imageUrlWithCache } from "@/lib/utils";

export default function SettingsPage() {
  const { profile, business, updateProfile, updateBusiness } = useAuth();
  const { t, lang } = useLanguage();
  const supabase = createSupabaseBrowserClient();

  const [businessName, setBusinessName] = useState(business?.name ?? "");
  const [currency, setCurrency] = useState(business?.currency ?? "USD");
  const [timezone, setTimezone] = useState(business?.timezone ?? "UTC");
  const [taxRate, setTaxRate] = useState(business?.tax_rate?.toString() ?? "0");
  const [address, setAddress] = useState(business?.address ?? "");
  const [phone, setPhone] = useState(business?.phone ?? "");
  const [vatNumber, setVatNumber] = useState(business?.vat_number ?? "");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");

  const [savingBiz, setSavingBiz] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const handleSaveBusiness = async () => {
    setSavingBiz(true);
    await updateBusiness({
      name: businessName,
      currency,
      timezone,
      tax_rate: parseFloat(taxRate) || 0,
      address,
      phone,
      vat_number: vatNumber,
    });
    setSavingBiz(false);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await updateProfile({ full_name: fullName, language: lang });
    setSavingProfile(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    setLogoUploading(true);
    const filePath = `logos/${business.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("business-assets")
      .upload(filePath, file);

    if (uploadError) {
      setLogoUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("business-assets").getPublicUrl(filePath);

    await updateBusiness({ logo_url: publicUrl });
    setLogoUploading(false);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl space-y-8"
    >
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {t.settings.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure your workspace
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="rounded-xl border bg-card p-6"
      >
        <h3 className="mb-4 text-lg font-semibold">
          {t.settings.businessInfo}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar
              key={imageUrlWithCache(business?.logo_url)}
              className="h-16 w-16"
            >
              <AvatarImage src={imageUrlWithCache(business?.logo_url)} />
              <AvatarFallback className="text-lg">
                {business?.name?.charAt(0) ?? "B"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{t.settings.businessLogo}</p>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <span className="cursor-pointer text-xs text-primary hover:underline">
                  {logoUploading ? "Uploading..." : "Change logo"}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.settings.businessName}
            </label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.settings.currency}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="ALL">ALL - Albanian Lek</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.settings.timezone}
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="UTC">UTC</option>
                <option value="US/Eastern">US/Eastern</option>
                <option value="US/Central">US/Central</option>
                <option value="US/Pacific">US/Pacific</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Europe/Tirane">Europe/Tirane</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.settings.taxRate}
              </label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t.settings.vatNumber}
              </label>
              <Input
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.settings.address}</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.settings.phone}</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11"
            />
          </div>

          <Button onClick={handleSaveBusiness} disabled={savingBiz}>
            {savingBiz ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savingBiz ? t.common.saving : t.common.save}
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="rounded-xl border bg-card p-6"
      >
        <h3 className="mb-4 text-lg font-semibold">
          {t.settings.profileSection}
        </h3>
        <div className="space-y-4">
          <ImageUpload
            key={imageUrlWithCache(profile?.profile_image_url)}
            bucket="avatars"
            path={`profiles/${profile?.id || "unknown"}`}
            existingUrl={profile?.profile_image_url ?? undefined}
            onUpload={(url) => updateProfile({ profile_image_url: url })}
            onRemove={() => updateProfile({ profile_image_url: null })}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.profile.fullName}</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.profile.email}</label>
            <Input
              value={profile?.email ?? ""}
              disabled
              className="h-11 text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.settings.language}</label>
            <LanguageSelector />
          </div>

          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {savingProfile ? t.common.saving : t.common.save}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
