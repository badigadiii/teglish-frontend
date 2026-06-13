import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod/v4";

export function zodFormResolver<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors = result.error.issues.reduce<
      Record<string, { type: string; message: string }>
    >((acc, issue) => {
      const name = issue.path[0];

      if (typeof name === "string" && !acc[name]) {
        acc[name] = {
          type: issue.code,
          message: issue.message,
        };
      }

      return acc;
    }, {});

    return {
      values: {},
      errors: errors as FieldErrors<TFieldValues>,
    };
  };
}
