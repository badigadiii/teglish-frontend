"use client";

import { LogOutIcon, MenuIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { learnerNavItems, staffNavItems } from "@/components/layout/nav-data";
import { RoleGate } from "@/components/layout/role-gate";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
import { BrandMark } from "@/components/shared/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AppHeaderProps = {
  variant: "public" | "app" | "staff";
};

export function AppHeader({ variant }: AppHeaderProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems =
    variant === "staff"
      ? [...learnerNavItems, ...staffNavItems]
      : variant === "app"
        ? learnerNavItems
        : [];

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <BrandMark compact={false} />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {navItems.length > 0 ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  aria-label="Open navigation"
                  className="md:hidden"
                  size="icon"
                  variant="outline"
                >
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Teglish navigation</SheetTitle>
                  <SheetDescription>
                    Move between learner and staff contexts without losing your
                    place.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 px-4 pb-6">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                          isActive
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                        href={item.href}
                      >
                        <span className="block font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {item.description}
                        </span>
                      </Link>
                    );
                  })}
                  {!user ? (
                    <div className="mt-4 flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button asChild className="flex-1" variant="outline">
                        <Link href="/register">Register</Link>
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={logout} type="button" variant="outline">
                      <LogOutIcon />
                      Log out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : null}

          {!user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="hidden items-center gap-2 md:inline-flex"
                  variant="outline"
                >
                  <span className="max-w-32 truncate">
                    {user.name || user.username}
                  </span>
                  <Badge variant="secondary">{user.role}</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <span className="block font-medium text-foreground">
                    {user.name || user.username}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/exercises/new">Create exercise</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/quizzes/new">Create quiz</Link>
                </DropdownMenuItem>
                <RoleGate allowedRoles={["admin", "moderator"]}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/staff">
                      <ShieldCheckIcon />
                      Staff area
                    </Link>
                  </DropdownMenuItem>
                </RoleGate>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
