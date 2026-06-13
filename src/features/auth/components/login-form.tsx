"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/features/auth/api";
import { type LoginValues, loginSchema } from "@/features/auth/schemas";
import { zodFormResolver } from "@/features/auth/zod-form-resolver";

export function LoginForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodFormResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(values: LoginValues) {
    form.clearErrors("root");

    try {
      await login(values);
      router.push("/learn");
      router.refresh();
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Не удалось войти в аккаунт",
      });
    }
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      {form.formState.errors.root?.message ? (
        <Alert variant="destructive">
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-username">Username</FieldLabel>
              <Input
                {...field}
                id="login-username"
                autoComplete="username"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="h-11"
        disabled={!mounted || form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? <Spinner /> : <LogIn />}
        Войти в аккаунт
      </Button>
    </form>
  );
}
