"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { imageUrlWithCache } from "@/lib/utils";
import Link from "next/link";

export function ProfileDropdown() {
  const { profile, business, signOut } = useAuth();
  const { t } = useLanguage();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SA";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted">
          <Avatar
            key={imageUrlWithCache(profile?.profile_image_url)}
            className="h-7 w-7"
          >
            <AvatarImage src={imageUrlWithCache(profile?.profile_image_url)} />
            <AvatarFallback className="text-[11px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {profile && business && (
            <div className="hidden text-left text-sm sm:block">
              <p className="truncate text-xs font-medium leading-tight">
                {profile.full_name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground leading-tight">
                {business.name}
              </p>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="truncate font-medium">{profile?.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {profile?.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/settings" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t.common.profile}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t.common.settings}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {t.common.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
