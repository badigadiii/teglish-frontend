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
  await page.getByRole("button", { name: "Создать" }).click();
  await page.getByRole("menuitem", { name: "Создать упражнение" }).click();
  await expectSwitchThumbToMove(page);
  await page.getByLabel("Задание").fill(text);
  await page
    .getByLabel("Правильные ответы, по одному на строку")
    .fill("I need help");
  await page
    .getByLabel("Варианты ответа, по одному на строку")
    .fill("I need help\nI am need help");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}

async function expectSwitchThumbToMove(page: Page) {
  const switchControl = page.getByRole("switch");
  const thumb = page.locator('[data-slot="switch-thumb"]');
  const before = await thumb.boundingBox();

  await switchControl.click();

  const after = await thumb.boundingBox();
  if (!before || !after) {
    throw new Error("Switch thumb bounding box was not available");
  }

  expect(after.x).toBeGreaterThan(before.x);
  await switchControl.click();
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
  await expect(page.getByText(exerciseText)).toBeHidden();

  await page.goto("/profile/exercises");
  const card = page.getByRole("article", { name: exerciseText });
  await expect(card).toBeVisible();
  await expect(card.getByRole("link", { name: "Начать" })).toHaveAttribute(
    "href",
    /\/exercises\/\d+\/play$/,
  );
  await card.getByRole("button", { name: "Действия упражнения" }).click();
  await expect(page.getByRole("menuitem", { name: "Изменить" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Удалить" })).toBeVisible();
});

test("creator can upload media while creating dictation exercise", async ({
  page,
  request,
}) => {
  const user = uniqueUser("creator-dictation");
  const exerciseText = "Listen and write the sentence";
  const mediaName = `dictation-${Date.now()}`;
  await registerViaBackend(request, user);
  await login(page, user);

  await page.getByRole("button", { name: "Создать" }).click();
  await page.getByRole("menuitem", { name: "Создать упражнение" }).click();
  await page.getByRole("tab", { name: "Диктант" }).click();
  await page.getByLabel("Задание").fill(exerciseText);
  await page.getByLabel("Текст диктанта").fill("I can hear you clearly");
  await page.getByLabel("Имя загружаемого медиа").fill(mediaName);
  await page.getByLabel("Загрузить медиафайл").setInputFiles({
    name: "dictation-audio.mp3",
    mimeType: "audio/mpeg",
    buffer: Buffer.from([0x49, 0x44, 0x33, 0x03]),
  });
  await page.getByRole("button", { name: "Загрузить медиа" }).click();

  await expect(page.getByLabel("Медиафайл")).toHaveValue(new RegExp(mediaName));

  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.goto("/profile/exercises");
  await expect(page.getByRole("article", { name: exerciseText })).toBeVisible();
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

  await page.getByRole("button", { name: "Создать" }).click();
  await page.getByRole("menuitem", { name: "Создать квиз" }).click();
  await expectSwitchThumbToMove(page);
  await page.getByLabel("Название").fill(quizTitle);
  await page.getByLabel("Описание").fill("Короткий квиз");
  await page.getByRole("button", { name: "Добавить упражнение" }).click();
  await expect(page.getByText("1. Translate: Доброе утро")).toBeVisible();
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText(quizTitle)).toBeHidden();

  await page.goto("/profile/quizzes");
  const card = page.getByRole("article", { name: quizTitle });
  await expect(card).toBeVisible();
  await expect(card.getByText("1 упражнений")).toBeVisible();
  await expect(card.getByRole("link", { name: "Начать" })).toHaveAttribute(
    "href",
    /\/quizzes\/\d+$/,
  );
  await card.getByRole("button", { name: "Действия квиза" }).click();
  await expect(page.getByRole("menuitem", { name: "Изменить" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Удалить" })).toBeVisible();
});
