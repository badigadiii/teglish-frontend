"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
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

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(100, "Username must be at most 100 characters."),
    name: z
      .string()
      .max(100, "Display name must be at most 100 characters.")
      .optional()
      .or(z.literal("")),
    password: z.string().min(4, "Password must be at least 4 characters long."),
    confirmPassword: z.string().min(4, "Please repeat your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [successUsername, setSuccessUsername] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<unknown>(null);
  const form = useForm<RegisterValues>({
    defaultValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(values: RegisterValues) {
    setSubmissionError(null);
    form.clearErrors();

    const parsed = registerSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string") {
          form.setError(fieldName as keyof RegisterValues, {
            message: issue.message,
          });
        }
      }

      return;
    }

    try {
      await register({
        username: values.username,
        password: values.password,
        name: values.name || null,
      });

      setSuccessUsername(values.username);
      form.reset();
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [fieldName, message] of Object.entries(error.fieldErrors)) {
          if (
            fieldName === "username" ||
            fieldName === "password" ||
            fieldName === "name"
          ) {
            form.setError(fieldName as keyof RegisterValues, { message });
          }
        }
      }

      setSubmissionError(error);
    }
  }

  if (successUsername) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Account created</CardTitle>
            <Badge variant="secondary">Stage 4</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            The account{" "}
            <span className="font-medium text-foreground">
              {successUsername}
            </span>{" "}
            is ready. The backend does not auto-issue a token on registration,
            so the next step is an explicit sign-in.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              startTransition(() => {
                router.push("/login?registered=1");
              })
            }
            type="button"
          >
            Go to login
          </Button>
          <Button
            onClick={() => setSuccessUsername(null)}
            type="button"
            variant="outline"
          >
            Register another account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Create an account</CardTitle>
          <Badge variant="secondary">Stage 4</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Frontend validation mirrors the backend contract: username `3-100`,
          password `4+`, and optional display name up to `100` characters.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {submissionError ? (
          <ApiErrorAlert error={submissionError} title="Registration failed" />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder="Student"
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
                      autoComplete="new-password"
                      placeholder="Choose a password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      placeholder="Repeat the password"
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
                {form.formState.isSubmitting
                  ? "Creating account..."
                  : "Register"}
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href="/login">Already have an account</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
