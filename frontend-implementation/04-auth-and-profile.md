# Этап 4. Auth And Profile

## Цель

Реализовать регистрацию, вход, выход, текущего пользователя и защиту маршрутов.

## Backend-контракт

### Регистрация

```text
POST /auth/register
Content-Type: application/json
```

Payload:

```json
{
  "username": "student",
  "password": "secret",
  "name": "Student"
}
```

Ограничения:

- `username`: 3-100 символов;
- `password`: минимум 4 символа;
- `name`: optional, максимум 100 символов;
- duplicate username: `409 Conflict`.

### Логин

```text
POST /auth/token
Content-Type: application/x-www-form-urlencoded
```

Form fields:

```text
username=student
password=secret
```

Ответ:

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

### Текущий пользователь

```text
GET /users/me
Authorization: Bearer <token>
```

Ответ:

```json
{
  "id": 1,
  "username": "student",
  "name": "Student",
  "role": "user",
  "is_active": true
}
```

## UI screens

### `/register`

Поля:

- username;
- name;
- password;
- password confirmation.

Поведение:

- клиентская валидация через Zod;
- password confirmation проверяется только на frontend;
- после успешной регистрации можно сразу отправить пользователя на `/login`;
- альтернативно выполнить auto-login, но backend register token не возвращает, поэтому это отдельный запрос к `/auth/token`.

Рекомендуемый MVP: после регистрации показывать success state и кнопку входа.

### `/login`

Поля:

- username;
- password.

Поведение:

- при успехе сохранить token;
- загрузить `/users/me`;
- redirect на `/profile` или return URL;
- при `401` показать понятную ошибку без раскрытия деталей.

### `/profile`

Показывать:

- display name;
- username;
- role;
- active status;
- быстрые действия: создать упражнение, создать квиз;
- staff link для `admin` и `moderator`.

## Auth provider

Создать `AuthProvider`.

Ответственность:

- хранить token;
- загружать current user;
- предоставлять `login`, `logout`, `register`;
- очищать token при `401`;
- отдавать `isAuthenticated`, `isLoading`, `user`.

## Route guards

Нужны два уровня защиты:

1. `RequireAuth`.

Для:

- `/profile`
- `/exercises/new`
- `/exercises/[id]/edit`
- `/quizzes/*`

2. `RequireRole`.

Для:

- `/staff/*`

Разрешенные роли:

- `admin`
- `moderator`

Важно: UI guard не является security boundary. Backend уже проверяет роли. Frontend guard нужен для UX.

## Header state

Header должен показывать:

- guest: login/register;
- authenticated: имя пользователя, роль, logout;
- staff: отдельный переход в staff area.

## Результат этапа

Пользователь может зарегистрироваться, войти, увидеть профиль и выйти. Staff-пользователь видит staff-навигацию. Обычный пользователь не видит staff-ссылки.

## Критерии готовности

- Невалидные формы не отправляются.
- Duplicate username показывает ошибку рядом с username или в общем alert.
- После истекшего/битого token пользователь разлогинивается.
- Страница `/profile` не дергает backend бесконечно при `401`.

