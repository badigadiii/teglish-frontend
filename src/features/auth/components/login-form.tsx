"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

import { useAuth } from "@/components/providers/auth-provider";
import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/errors/api-error";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasToken, isLoading, isAuthenticated, login } = useAuth();
  const form = useForm<LoginValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registered = searchParams.get("registered");

  useEffect(() => {
    if (!isLoading && (isAuthenticated || hasToken)) {
      router.replace(searchParams.get("redirect") || "/profile");
    }
  }, [hasToken, isAuthenticated, isLoading, router, searchParams]);

  async function handleSubmit(values: LoginValues) {
    form.clearErrors();

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string") {
          form.setError(fieldName as keyof LoginValues, {
            message: issue.message,
          });
        }
      }

      return;
    }

    try {
      await login(values.username, values.password);
      startTransition(() => {
        router.replace(searchParams.get("redirect") || "/profile");
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        form.setError("root", {
          message: "Incorrect username or password.",
        });
        return;
      }

      form.setError("root", {
        message: error instanceof Error ? error.message : "Login failed.",
      });
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Log in</CardTitle>
          <Badge variant="secondary">Stage 4</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Use your Teglish account to create content, review profile details,
          and continue quiz flows.
        </p>
        {registered ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground">
            Registration completed. Sign in with the account you just created.
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {form.formState.errors.root?.message ? (
          <ApiErrorAlert
            error={new ApiError(401, form.formState.errors.root.message)}
            title="Login failed"
          />
        ) : null}

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="username"
                      placeholder="student"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? "Signing in..." : "Log in"}
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href="/register">Create a new account</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
