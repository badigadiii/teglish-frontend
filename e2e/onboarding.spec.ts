import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from "@playwright/test";

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
  const response = await request.post("http://127.0.0.1:8000/auth/register", {
    data: user,
  });

  expect(response.status()).toBe(201);
}

async function openLoginForm(page: Page) {
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Английский через квизы и упражнения",
    }),
  ).toBeHidden();

  const loginPanel = page.getByRole("region", { name: "Вход в Teglish" });
  await expect(
    loginPanel.getByRole("button", { name: "Войти в аккаунт" }),
  ).toBeEnabled();

  return loginPanel;
}

test("new user can register and land in the authenticated shell", async ({
  page,
}) => {
  const user = uniqueUser("register");

  await page.goto("/");
  await page.getByRole("button", { name: "Начать обучение" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Английский через квизы и упражнения",
    }),
  ).toBeHidden();
  await page.getByLabel("Имя").fill(user.name);
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();

  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByRole("banner")).toContainText("Teglish");
  await expect(page.getByText(user.name)).toBeVisible();
});

test("existing user can login and land in the authenticated shell", async ({
  page,
  request,
}) => {
  const user = uniqueUser("login");
  await registerViaBackend(request, user);

  await page.goto("/");
  const loginPanel = await openLoginForm(page);
  await loginPanel.getByLabel("Username").fill(user.username);
  await loginPanel.getByLabel("Password").fill(user.password);
  await loginPanel.getByRole("button", { name: "Войти в аккаунт" }).click();

  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByText(user.name)).toBeVisible();
});

test("duplicate username keeps the conflict message visible", async ({
  page,
  request,
}) => {
  const user = uniqueUser("duplicate");
  await registerViaBackend(request, user);

  await page.goto("/");
  await page.getByRole("button", { name: "Начать обучение" }).click();
  await page.getByLabel("Имя").fill(user.name);
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();

  await expect(
    page.getByText("Пользователь с таким username уже существует"),
  ).toBeVisible();
  await expect(page).toHaveURL("/");
});

test("logout returns the user to onboarding and protects app routes", async ({
  page,
  request,
}) => {
  const user = uniqueUser("logout");
  await registerViaBackend(request, user);

  await page.goto("/");
  const loginPanel = await openLoginForm(page);
  await loginPanel.getByLabel("Username").fill(user.username);
  await loginPanel.getByLabel("Password").fill(user.password);
  await loginPanel.getByRole("button", { name: "Войти в аккаунт" }).click();
  await expect(page).toHaveURL(/\/learn$/);

  await page.getByRole("button", { name: /Профиль/ }).click();
  await page.getByRole("menuitem", { name: "Выйти" }).click();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", {
      name: "Английский через квизы и упражнения",
    }),
  ).toBeVisible();

  await page.goto("/learn");
  await expect(page).toHaveURL("/");
});
