import axios, { type AxiosError } from "axios";

import { networkError, normalizeApiError } from "@/lib/api/errors";

export const backendBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const apiClient = axios.create({
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      throw networkError();
    }

    throw normalizeApiError(error.response.status, error.response.data);
  },
);
