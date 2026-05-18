# Этап 3. API Client And State

## Цель

Создать типизированный слой доступа к FastAPI backend, единый формат ошибок и предсказуемое состояние авторизации.

## Backend base URL

Все запросы должны строиться от:

```ts
process.env.NEXT_PUBLIC_API_BASE_URL
```

Примеры backend routes:

```text
POST /auth/register
POST /auth/token
GET /users/me
GET /exercises/{id}/question
POST /exercises/{id}/perform
POST /media
POST /quizzes/{id}/perform/start
POST /quizzes/sessions/{id}/answer
POST /quizzes/sessions/{id}/finish
```

## Типы API

В `lib/api/types.ts` нужно вручную описать типы, соответствующие Pydantic-схемам.

Ключевые типы:

```ts
type UserRole = "admin" | "moderator" | "user";

type UserRead = {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  is_active: boolean;
};

type Token = {
  access_token: string;
  token_type: "bearer";
};
```

Для exercises обязательно использовать discriminated union:

```ts
type ExerciseType = "grammar" | "translate" | "dictation";
```

Это важно, потому что backend валидирует payload через discriminator `type`.

## HTTP-клиент

Создать `lib/api/http.ts`.

Ответственность:

- добавлять `Authorization: Bearer <token>`, если токен есть;
- собирать URL;
- парсить JSON;
- обрабатывать `204 No Content`;
- нормализовать ошибки FastAPI;
- поддерживать `FormData` для `/media`;
- поддерживать `URLSearchParams` для `/auth/token`.

Не нужно использовать axios, если fetch закрывает требования. Чем меньше зависимостей, тем проще поддержка.

## Нормализация ошибок

FastAPI может вернуть:

- строковый `detail`;
- массив validation errors;
- status code без подробного тела.

Нужен единый тип:

```ts
type ApiError = {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
};
```

UI должен показывать:

- `401`: предложение войти заново;
- `403`: недостаточно прав;
- `404`: сущность не найдена;
- `409`: конфликт, например duplicate username;
- `422`: ошибки валидации формы;
- `500+`: generic backend error.

## Endpoint modules

Создать файлы:

```text
lib/api/auth.ts
lib/api/users.ts
lib/api/exercises.ts
lib/api/media.ts
lib/api/quizzes.ts
```

### Auth

- `registerUser(payload)`
- `login(username, password)`

Особенность `login`: отправлять `application/x-www-form-urlencoded`, не JSON.

### Users

- `getMe()`

### Exercises

- `getExerciseQuestion(id)`
- `performExercise(id, payload)`
- `getExercises()`
- `getExercise(id)`
- `createExercise(payload)`
- `updateExercise(id, payload)`
- `deleteExercise(id)`

### Media

- `uploadMedia(file, name?)`
- `getMediaUrl(mediaFilename)`

`getMediaUrl` не обязан делать fetch. Для audio/video можно строить прямой URL:

```ts
`${API_BASE_URL}/media/${encodeURIComponent(mediaFilename)}`
```

### Quizzes

- `getQuizzes()`
- `createQuiz(payload)`
- `getQuiz(id)`
- `updateQuiz(id, payload)`
- `deleteQuiz(id)`
- `startQuiz(id)`
- `answerQuizSession(sessionId, payload)`
- `finishQuizSession(sessionId)`
- `getQuizSession(sessionId)`

## Client state

Рекомендуется использовать TanStack Query:

- query keys должны быть централизованы;
- mutations должны invalidated связанные queries;
- auth user query `/users/me` должна быть основой для role gates;
- после logout кеш нужно чистить.

Если TanStack Query не добавляется, нужно хотя бы создать собственный легкий слой hooks. Но для данного проекта query library оправдана: есть формы, сессии, staff lists и refetch после mutations.

## Token storage

Практичный вариант для первой версии:

- хранить access token в `localStorage`;
- держать auth state в client provider;
- при старте приложения пробовать `/users/me`;
- при `401` очищать токен.

Более защищенный вариант:

- NextJS route handlers;
- HttpOnly cookie;
- proxy-запросы к backend.

На текущем backend нет refresh token и cookie-сессий, поэтому HttpOnly cookie потребует дополнительной frontend proxy-логики. Для MVP допустим `localStorage`, но это должно быть явно зафиксировано как компромисс.

## Результат этапа

Все API-вызовы доступны через типизированные функции. UI-слой не знает деталей FastAPI, форматов ошибок, URLSearchParams, FormData и Bearer header.

## Критерии готовности

- `login` успешно получает token на локальном backend.
- `/users/me` успешно возвращает текущего пользователя.
- Ошибки `401`, `403`, `409`, `422` отображаются одинаковым UI-компонентом.
- TypeScript не допускает отправку dictation payload в grammar endpoint shape.

