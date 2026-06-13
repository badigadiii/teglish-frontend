"use client";

import {
  BookOpen,
  ChevronDown,
  Home,
  LibraryBig,
  LogOut,
  PenTool,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/api";
import type { UserRead } from "@/features/auth/types";

const navItems = [
  { href: "/learn", label: "main", icon: Home },
  { href: "/quizzes", label: "quizzes", icon: LibraryBig },
  { href: "/create", label: "create", icon: PenTool },
];

function initials(user: UserRead) {
  return (user.name || user.username).slice(0, 2).toUpperCase();
}

export function AppShell({
  user,
  children,
}: {
  user: UserRead;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5">
      <header className="sticky top-4 z-20 rounded-lg border bg-card/90 px-3 py-3 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/learn" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="size-5" />
            </span>
            <span className="text-xl font-black tracking-normal">Teglish</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className="capitalize"
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2"
                aria-label={`Профиль ${user.name}`}
              >
                <Avatar className="size-7 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-xs font-black text-primary-foreground">
                    {initials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-32 truncate">{user.name}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="grid gap-1">
                <span>{user.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  @{user.username}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="size-4" />
                role: {user.role}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                status: {user.is_active ? "active" : "inactive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="size-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="py-8">{children}</main>
    </div>
  );
}
