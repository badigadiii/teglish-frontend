import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError, getErrorMessage } from "@/lib/errors/api-error";

type ApiErrorAlertProps = {
  error: unknown;
  title?: string;
};

export function ApiErrorAlert({
  error,
  title = "Request failed",
}: ApiErrorAlertProps) {
  const fieldErrors =
    error instanceof ApiError && error.fieldErrors
      ? Object.entries(error.fieldErrors)
      : [];

  return (
    <Alert variant="destructive">
      <AlertCircleIcon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{getErrorMessage(error)}</p>
        {fieldErrors.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {fieldErrors.map(([field, message]) => (
              <li key={field}>
                <span className="font-medium capitalize">
                  {field.replaceAll(".", " ")}:
                </span>{" "}
                {message}
              </li>
            ))}
          </ul>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
