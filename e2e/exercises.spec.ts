import { expect, test } from "@playwright/test";

import {
  createDictationExercise,
  createGrammarExercise,
  loginViaApi,
  registerUserViaApi,
  uniqueUsername,
} from "./helpers/backend";

test("public grammar exercise shows wrong and correct answer feedback", async ({
  page,
  request,
}) => {
  const username = uniqueUsername("grammar");
  const password = "secret123";

  await registerUserViaApi(request, username, password, "Grammar Author");
  const token = await loginViaApi(request, username, password);
  const exerciseId = await createGrammarExercise(request, token);

  await page.goto(`/exercises/${exerciseId}`);

  await expect(
    page.getByRole("heading", { name: "Public exercise player" }),
  ).toBeVisible();
  await expect(page.getByText("Choose the correct verb")).toBeVisible();

  await page.getByRole("button", { name: "are" }).click();
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(page.getByText("Ответ неверный")).toBeVisible();

  await page.getByRole("button", { name: "is" }).click();
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(page.getByText("Ответ верный")).toBeVisible();
});

test("public dictation exercise renders audio through the proxy and accepts the correct answer", async ({
  page,
  request,
}) => {
  const username = uniqueUsername("dictation");
  const password = "secret123";

  await registerUserViaApi(request, username, password, "Dictation Author");
  const token = await loginViaApi(request, username, password);
  const exerciseId = await createDictationExercise(request, token);

  await page.goto(`/exercises/${exerciseId}`);

  const audio = page.locator("audio");
  await expect(audio).toBeVisible();
  await expect(audio).toHaveAttribute("src", /\/api\/media\//);

  await page.getByPlaceholder("Type what you hear").fill("wrong answer");
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(page.getByText("Ответ неверный")).toBeVisible();

  await page.getByPlaceholder("Type what you hear").fill("hello world");
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(page.getByText("Ответ верный")).toBeVisible();
});
