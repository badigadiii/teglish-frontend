import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from "@playwright/test";

const backendUrl = "http://127.0.0.1:8000";
const password = "pass1234";

type TestUser = ReturnType<typeof uniqueUser>;

function uniqueUser(prefix: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    name: `Тест ${prefix}`,
    username: `pw_${prefix}_${suffix}`,
    password,
  };
}

async function registerViaBackend(request: APIRequestContext, user: TestUser) {
  const response = await request.post(`${backendUrl}/auth/register`, {
    data: user,
  });

  expect(response.status()).toBe(201);
}

async function getToken(request: APIRequestContext, user: TestUser) {
  const response = await request.post(`${backendUrl}/auth/token`, {
    form: {
      username: user.username,
      password: user.password,
    },
  });

  expect(response.status()).toBe(200);
  const body = (await response.json()) as { access_token: string };

  return body.access_token;
}

async function login(page: Page, user: TestUser) {
  await page.goto("/");
  await page.getByRole("button", { name: "Войти" }).click();
  const loginPanel = page.getByRole("region", { name: "Вход в Teglish" });
  await loginPanel.getByLabel("Username").fill(user.username);
  await loginPanel.getByLabel("Password").fill(user.password);
  await loginPanel.getByRole("button", { name: "Войти в аккаунт" }).click();
  await expect(page).toHaveURL(/\/learn$/);
}

async function createExercise(
  request: APIRequestContext,
  token: string,
  data: {
    type: "translate" | "grammar";
    exercise_text: string;
    answer: string;
    options: string[];
    public?: boolean;
  },
) {
  const payload =
    data.type === "grammar"
      ? {
          exercise_text: data.exercise_text,
          public: data.public ?? true,
          type: "grammar",
          payload: {
            correct_answer: data.answer,
            response_options: data.options,
          },
        }
      : {
          exercise_text: data.exercise_text,
          public: data.public ?? true,
          type: "translate",
          payload: {
            correct_answers: [data.answer],
            response_options: data.options,
          },
        };

  const response = await request.post(`${backendUrl}/exercises`, {
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  });

  expect(response.status()).toBe(200);

  return (await response.json()) as { id: number; exercise_text: string };
}

async function createQuiz(
  request: APIRequestContext,
  token: string,
  data: {
    title: string;
    exerciseIds: number[];
    public?: boolean;
  },
) {
  const response = await request.post(`${backendUrl}/quizzes`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: data.title,
      description: "Student flow fixture",
      exercise_ids: data.exerciseIds,
      public: data.public ?? true,
    },
  });

  expect(response.status()).toBe(200);

  return (await response.json()) as { id: number; title: string };
}

test("student can browse public quizzes", async ({ page, request }) => {
  const user = uniqueUser("browse-quizzes");
  await registerViaBackend(request, user);
  const token = await getToken(request, user);
  const exercise = await createExercise(request, token, {
    type: "translate",
    exercise_text: "Translate: Мне нужна помощь",
    answer: "I need help",
    options: ["I need help", "I need a help"],
  });
  const quiz = await createQuiz(request, token, {
    title: `Public quiz ${exercise.id}`,
    exerciseIds: [exercise.id],
  });

  await login(page, user);
  await page.goto("/quizzes");

  await expect(
    page.getByRole("heading", { name: "Public quizzes" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: quiz.title })).toBeVisible();
});

test("unauthenticated student route redirects to login", async ({
  page,
  request,
}) => {
  const user = uniqueUser("start-login");
  await registerViaBackend(request, user);
  const token = await getToken(request, user);
  const exercise = await createExercise(request, token, {
    type: "grammar",
    exercise_text: "Choose the verb",
    answer: "is",
    options: ["is", "are"],
  });
  const quiz = await createQuiz(request, token, {
    title: `Login gated quiz ${exercise.id}`,
    exerciseIds: [exercise.id],
  });

  await page.goto(`/quizzes/${quiz.id}`);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
});

test("student can start, answer, finish, and review a quiz", async ({
  page,
  request,
}) => {
  const user = uniqueUser("play-quiz");
  await registerViaBackend(request, user);
  const token = await getToken(request, user);
  const translate = await createExercise(request, token, {
    type: "translate",
    exercise_text: "Translate: Мне нужна помощь",
    answer: "I need help",
    options: ["I need help", "I need a help"],
  });
  const grammar = await createExercise(request, token, {
    type: "grammar",
    exercise_text: "Choose: She __ ready",
    answer: "is",
    options: ["is", "are"],
  });
  const quiz = await createQuiz(request, token, {
    title: `Training quiz ${translate.id}`,
    exerciseIds: [translate.id, grammar.id],
  });

  await login(page, user);
  await page.goto(`/quizzes/${quiz.id}`);
  await page.getByRole("button", { name: "Start quiz" }).click();
  await expect(page).toHaveURL(new RegExp(`/quizzes/${quiz.id}/play`));
  const playUrl = page.url();
  const sessionId = new URL(playUrl).searchParams.get("sessionId");
  expect(sessionId).toBeTruthy();

  await page.goto("/profile/attempts");
  await expect(page.getByText("Активно")).toBeVisible();
  await page.getByRole("link", { name: "Продолжить" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/quizzes/${quiz.id}/play\\?sessionId=${sessionId}`),
  );

  await page.getByRole("button", { name: "I need help" }).click();
  await expect(page.getByText("Correct")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();

  await page.getByRole("button", { name: "is" }).click();
  await expect(page.getByText("Correct")).toBeVisible();
  await page.getByRole("button", { name: "Finish quiz" }).click();

  await expect(page).toHaveURL(/\/results\/quiz-sessions\/\d+$/);
  await expect(
    page.getByRole("heading", { name: "Quiz result" }),
  ).toBeVisible();
  await expect(page.getByText("2/2 correct")).toBeVisible();

  await page.reload();
  await expect(page.getByText("2/2 correct")).toBeVisible();
});

test("standalone exercise shows correct and wrong feedback", async ({
  page,
  request,
}) => {
  const user = uniqueUser("exercise-play");
  await registerViaBackend(request, user);
  const token = await getToken(request, user);
  const exercise = await createExercise(request, token, {
    type: "grammar",
    exercise_text: "Choose: They __ ready",
    answer: "are",
    options: ["is", "are"],
  });

  await login(page, user);
  await page.goto(`/exercises/${exercise.id}/play`);

  await page.getByRole("button", { name: "is", exact: true }).click();
  await expect(page.getByText("Wrong answer")).toBeVisible();
  await page.getByRole("button", { name: "are", exact: true }).click();
  await expect(page.getByText("Correct")).toBeVisible();
});

test("private quiz public detail renders not found", async ({
  page,
  request,
}) => {
  const user = uniqueUser("private-quiz");
  await registerViaBackend(request, user);
  const token = await getToken(request, user);
  const exercise = await createExercise(request, token, {
    type: "translate",
    exercise_text: "Translate private fixture",
    answer: "private",
    options: ["private", "public"],
    public: false,
  });
  const quiz = await createQuiz(request, token, {
    title: `Private quiz ${exercise.id}`,
    exerciseIds: [exercise.id],
    public: false,
  });

  await login(page, user);
  await page.goto(`/quizzes/${quiz.id}`);

  await expect(
    page.getByRole("heading", { name: "Quiz not found" }),
  ).toBeVisible();
});
