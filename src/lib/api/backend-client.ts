import "server-only";

import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

import { backendBaseUrl } from "@/lib/api/client";
import { networkError, normalizeApiError } from "@/lib/api/errors";

export const backendClient = axios.create({
  baseURL: backendBaseUrl,
  headers: {
    Accept: "application/json",
  },
});

backendClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      throw networkError();
    }

    throw normalizeApiError(error.response.status, error.response.data);
  },
);

export function withBearerToken(
  token: string,
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}
