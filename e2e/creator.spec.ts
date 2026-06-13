import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from "@playwright/test";

const backendUrl = "http://127.0.0.1:8000";
const password = "pass1234";

function uniqueUser(prefix: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    name: `Тест ${prefix}`,
    username: `pw_${prefix}_${suffix}`,
    password,
  };
}

async function registerViaBackend(
  request: APIRequestContext,
  user: ReturnType<typeof uniqueUser>,
) {
  const response = await request.post(`${backendUrl}/auth/register`, {
    data: user,
  });

  expect(response.status()).toBe(201);
}

async function login(page: Page, user: ReturnType<typeof uniqueUser>) {
  await page.goto("/");
  await page.getByRole("button", { name: "Войти" }).click();
  const loginPanel = page.getByRole("region", { name: "Вход в Teglish" });
  await loginPanel.getByLabel("Username").fill(user.username);
  await loginPanel.getByLabel("Password").fill(user.password);
  await loginPanel.getByRole("button", { name: "Войти в аккаунт" }).click();
  await expect(page).toHaveURL(/\/learn$/);
}

async function createTranslateExercise(page: Page, text: string) {
  await page.goto("/create");
  await page.getByRole("button", { name: "Упражнение" }).click();
  await page.getByLabel("Задание").fill(text);
  await page
    .getByLabel("Правильные ответы, по одному на строку")
    .fill("I need help");
  await page
    .getByLabel("Варианты ответа, по одному на строку")
    .fill("I need help\nI am need help");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText(text)).toBeVisible();
}

test("creator can create translation exercise from modal", async ({
  page,
  request,
}) => {
  const user = uniqueUser("creator-exercise");
  const exerciseText = "Translate: Мне нужна помощь";
  await registerViaBackend(request, user);
  await login(page, user);

  await createTranslateExercise(page, exerciseText);
});

test("creator can create quiz from selected exercise order", async ({
  page,
  request,
}) => {
  const user = uniqueUser("creator-quiz");
  const exerciseText = "Translate: Доброе утро";
  const quizTitle = "Morning phrases";
  await registerViaBackend(request, user);
  await login(page, user);
  await createTranslateExercise(page, exerciseText);

  await page.getByRole("button", { name: "Квиз" }).click();
  await page.getByLabel("Название").fill(quizTitle);
  await page.getByLabel("Описание").fill("Короткий квиз");
  await page.getByRole("button", { name: "Добавить упражнение" }).click();
  await expect(page.getByText("1. Translate: Доброе утро")).toBeVisible();
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("tab", { name: "Квизы" }).click();
  await expect(page.getByText(quizTitle)).toBeVisible();
  await expect(page.getByText("1 упражнений")).toBeVisible();
});
