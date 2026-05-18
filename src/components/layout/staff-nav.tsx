"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { staffNavItems } from "@/components/layout/nav-data";

export function StaffNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Staff navigation" className="flex flex-wrap gap-2">
      {staffNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
