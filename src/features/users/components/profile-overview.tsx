"use client";

import Link from "next/link";

import { RoleGate } from "@/components/layout/role-gate";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function ProfileOverview() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card className="shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{user.name || user.username}</CardTitle>
            <Badge>{user.role}</Badge>
            <Badge variant={user.is_active ? "secondary" : "destructive"}>
              {user.is_active ? "active" : "inactive"}
            </Badge>
          </div>
          <CardDescription>
            The profile screen is driven by `/users/me` and acts as the base for
            route guards and role-aware navigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">
                  Username
                </TableCell>
                <TableCell>@{user.username}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">
                  Display name
                </TableCell>
                <TableCell>{user.name || "Not provided"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">
                  Role
                </TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">
                  Active
                </TableCell>
                <TableCell>{user.is_active ? "Yes" : "No"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>
            These routes are already wired even where deeper authoring flows are
            still scaffolded for later stages.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/exercises/new">Create exercise</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/quizzes/new">Create quiz</Link>
          </Button>
          <RoleGate allowedRoles={["admin", "moderator"]}>
            <Button asChild variant="secondary">
              <Link href="/staff">Open staff area</Link>
            </Button>
          </RoleGate>
        </CardContent>
      </Card>
    </div>
  );
}
