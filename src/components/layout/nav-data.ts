import type { UserRole } from "@/lib/api/types";

export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export const learnerNavItems: NavItem[] = [
  {
    href: "/profile",
    label: "Profile",
    description: "Your current account, role, and shortcuts.",
  },
  {
    href: "/exercises/new",
    label: "Exercise Lab",
    description: "Prepare new practice tasks and dictations.",
  },
  {
    href: "/quizzes/new",
    label: "Quiz Builder",
    description: "Assemble exercises into a timed learning flow.",
  },
];

export const staffNavItems: NavItem[] = [
  {
    href: "/staff",
    label: "Dashboard",
    description: "Staff overview and operational shortcuts.",
  },
  {
    href: "/staff/exercises",
    label: "Exercises",
    description: "Moderation list for authored exercises.",
  },
  {
    href: "/staff/quizzes",
    label: "Quizzes",
    description: "Moderation list for authored quizzes.",
  },
  {
    href: "/staff/media",
    label: "Media",
    description: "Upload and verify dictation media assets.",
  },
];

export function isStaffRole(role: UserRole | undefined | null) {
  return role === "admin" || role === "moderator";
}
