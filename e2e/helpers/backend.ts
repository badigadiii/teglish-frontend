import { type APIRequestContext, expect } from "@playwright/test";

const API_BASE_URL = "http://127.0.0.1:8000";

export function uniqueUsername(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function registerUserViaApi(
  request: APIRequestContext,
  username: string,
  password: string,
  name: string,
) {
  const response = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      username,
      password,
      name,
    },
  });

  expect(response.ok()).toBeTruthy();
}

export async function loginViaApi(
  request: APIRequestContext,
  username: string,
  password: string,
) {
  const response = await request.post(`${API_BASE_URL}/auth/token`, {
    form: {
      username,
      password,
    },
  });

  expect(response.ok()).toBeTruthy();

  const data = (await response.json()) as {
    access_token: string;
  };

  return data.access_token;
}

export async function createGrammarExercise(
  request: APIRequestContext,
  token: string,
) {
  const response = await request.post(`${API_BASE_URL}/exercises`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      type: "grammar",
      exercise_text: "Choose the correct verb",
      payload: {
        correct_answer: "is",
        response_options: ["is", "are", "am"],
      },
    },
  });

  expect(response.ok()).toBeTruthy();
  const data = (await response.json()) as { id: number };
  return data.id;
}

export async function createDictationExercise(
  request: APIRequestContext,
  token: string,
) {
  const uploadResponse = await request.post(`${API_BASE_URL}/media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    multipart: {
      file: {
        name: "sample.mp3",
        mimeType: "audio/mpeg",
        buffer: Buffer.from("ID3"),
      },
      name: "sample-audio",
    },
  });

  expect(uploadResponse.ok()).toBeTruthy();
  const uploadData = (await uploadResponse.json()) as {
    media_filename: string;
  };

  const response = await request.post(`${API_BASE_URL}/exercises`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      type: "dictation",
      exercise_text: "Listen and write the phrase",
      payload: {
        speech_text: "hello world",
        media_filename: uploadData.media_filename,
      },
    },
  });

  expect(response.ok()).toBeTruthy();
  const data = (await response.json()) as { id: number };
  return data.id;
}
