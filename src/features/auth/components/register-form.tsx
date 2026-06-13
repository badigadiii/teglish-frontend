"use client";

import { UserPlus } from "lucide-react";
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
import { register } from "@/features/auth/api";
import { type RegisterValues, registerSchema } from "@/features/auth/schemas";
import { zodFormResolver } from "@/features/auth/zod-form-resolver";

export function RegisterForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodFormResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(values: RegisterValues) {
    form.clearErrors("root");

    try {
      await register(values);
      router.push("/learn");
      router.refresh();
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Не удалось создать аккаунт",
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
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-name">Имя</FieldLabel>
              <Input
                {...field}
                id="register-name"
                autoComplete="name"
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
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-username">Username</FieldLabel>
              <Input
                {...field}
                id="register-username"
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
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                {...field}
                id="register-password"
                type="password"
                autoComplete="new-password"
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
        {form.formState.isSubmitting ? <Spinner /> : <UserPlus />}
        Создать аккаунт
      </Button>
    </form>
  );
}
