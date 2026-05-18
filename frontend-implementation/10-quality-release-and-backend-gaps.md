# Этап 10. Quality, Release And Backend Gaps

## Цель

Довести frontend до состояния, пригодного для локальной разработки, проверки и дальнейшего расширения продукта.

## Тестирование

### Unit/component tests

Покрыть:

- API error normalization;
- auth token storage behavior;
- exercise discriminated union renderers;
- quiz answer state update;
- form validation schemas.

Инструменты:

- Vitest;
- React Testing Library.

### E2E tests

Критические сценарии:

- регистрация;
- логин;
- создание grammar exercise;
- прохождение public exercise;
- загрузка media;
- создание dictation exercise;
- создание quiz;
- старт quiz session;
- answer + finish;
- staff exercises list.

Инструмент:

- Playwright.

Для E2E нужен стабильный backend seed. Сейчас backend уже имеет bootstrap admin user по миграции, но для повторяемых тестов полезны отдельные fixtures.

## Quality gates

Обязательные команды:

```bash
npm run lint
npm run typecheck
npm run build
```

Если добавлены tests:

```bash
npm run test
npm run test:e2e
```

## Runtime checks

Проверить:

- frontend работает при backend offline и показывает controlled error;
- `NEXT_PUBLIC_API_BASE_URL` отсутствует или неверный;
- `401` очищает token;
- `403` не зацикливает redirect;
- relative `media_url` корректно превращается в absolute URL;
- mobile layout не ломается на player/session screens.

## Deployment

Минимальный вариант:

- backend запускается отдельно;
- frontend запускается отдельно через NextJS;
- CORS должен быть настроен на backend, если origin отличается.

В текущем backend `src/main.py` не показывает CORS middleware. Если frontend будет на другом origin, нужно добавить CORS на backend.

Рекомендуемые env:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

## Backend gaps, влияющие на frontend

### 1. Нет публичного каталога упражнений

Сейчас:

- `GET /exercises` staff-only;
- public user может открыть question только если знает ID.

Нужно для продукта:

- `GET /exercises/public`;
- фильтры по type/topic/difficulty/status;
- pagination.

### 2. Нет списка media

Сейчас:

- media можно загрузить;
- media можно получить по filename;
- списка media нет.

Нужно:

- `GET /media`;
- metadata: type, size, created_at, owner_id;
- delete endpoint или lifecycle policy.

### 3. Обычный автор не может загрузить свое упражнение для редактирования

Сейчас:

- `GET /exercises/{id}` staff-only;
- PATCH автору разрешен, но frontend не может предварительно получить полные данные.

Нужно:

- разрешить автору `GET /exercises/{id}`;
- или добавить `GET /users/me/exercises/{id}`.

### 4. Нет модерации

Product docs требуют moderation workflow, но backend не содержит status и approve/reject.

Нужно:

- moderation status;
- review queue;
- transition endpoint'ы;
- rejection reason.

### 5. Нет exam mode

Product docs описывают exam mode, но backend всегда возвращает `is_correct` на answer.

Нужно:

- session mode: `training` или `exam`;
- скрывать correctness до finish для exam;
- возвращать result summary после finish.

### 6. Нет истории сессий пользователя

Сейчас можно получить только конкретную session по ID.

Нужно:

- `GET /users/me/quiz-sessions`;
- pagination;
- фильтр по quiz_id/status.

### 7. Нет рейтинга и очков

Product docs говорят о баллах и рейтинге, backend пока не содержит score model.

Нужно:

- points ledger;
- leaderboard endpoint;
- profile statistics.

## Рекомендуемый порядок релиза

1. MVP learner/staff frontend на текущем API.
2. Backend-доработки для catalog, author read, media list.
3. Moderation workflow.
4. Training/exam split.
5. Progress, рейтинг, история.

## Результат этапа

Frontend стабильно собирается, покрывает основные сценарии текущего backend и имеет явный список backend-доработок для продуктовой версии.

## Критерии готовности

- Все quality gates проходят.
- E2E покрывает хотя бы happy path auth -> create exercise -> perform -> quiz session.
- Документированы backend-gaps, которые нельзя корректно решить только frontend'ом.
- Deployment instructions описывают API base URL и CORS.

