# План реализации frontend для Teglish

## Исходный контекст

Проект сейчас содержит backend на FastAPI для платформы изучения английского языка. Frontend-кода в репозитории нет, поэтому план предполагает создание отдельного NextJS-приложения поверх существующего API.

Использованные источники анализа:

- `backend/.agents/docs/project-overview.md`
- `backend/.agents/docs/teglish.md`
- `backend/.agents/docs/auth.md`
- `backend/.agents/docs/users.md`
- `backend/.agents/docs/exercises.md`
- `backend/.agents/docs/media.md`
- `backend/.agents/docs/quizzes.md`
- `backend/.agents/docs/db.md`
- `backend/src/*/router.py`
- `backend/src/*/schemas.py`

## Текущий backend-контракт

Доступные домены:

- `auth`: регистрация, логин, JWT access token.
- `users`: текущий пользователь через `/users/me`.
- `exercises`: создание, редактирование, просмотр staff-списка, публичный question endpoint, проверка ответа.
- `media`: загрузка аудио/видео для диктантов и выдача файла.
- `quizzes`: управление квизами, старт сессии, ответы, завершение, детали сессии.

Важно для frontend:

- API публикуется без `/api/v1`: `/auth`, `/users`, `/exercises`, `/media`, `/quizzes`.
- `POST /auth/token` принимает `application/x-www-form-urlencoded`, потому что использует `OAuth2PasswordRequestForm`.
- Большинство write-flow требует Bearer token.
- `GET /exercises/{id}/question` и `POST /exercises/{id}/perform` публичные.
- `GET /exercises` доступен только `admin` и `moderator`.
- `GET /quizzes` доступен только `admin` и `moderator`.
- `GET /quizzes/{id}` доступен любому авторизованному пользователю.

## Целевое frontend-приложение

Стек:

- NextJS App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Biome
- TanStack Query

Рекомендуемая директория приложения:

```text
frontend/
```

Документация по реализации сохранена отдельно от будущего frontend-кода в:

```text
frontend-implementation/
```

## Этапы

1. `01-project-foundation.md`: создание NextJS-приложения, настройка TypeScript, Tailwind, shadcn, env.
2. `02-design-system-and-navigation.md`: визуальная система, layout, маршруты, responsive shell.
3. `03-api-client-and-state.md`: HTTP-клиент, типы API, авторизация, обработка ошибок.
4. `04-auth-and-profile.md`: регистрация, логин, выход, профиль, route guards.
5. `05-public-exercise-player.md`: публичное прохождение отдельного упражнения.
6. `06-media-and-dictation.md`: загрузка медиа и UX диктанта.
7. `07-exercise-authoring.md`: создание и редактирование упражнений.
8. `08-quizzes-and-sessions.md`: создание квизов и прохождение сессий.
9. `09-staff-and-admin-flows.md`: staff-панель для упражнений, квизов и контента.
10. `10-quality-release-and-backend-gaps.md`: тестирование, сборка, релиз, backend-gaps.

## Главный принцип реализации

Не проектировать frontend вокруг будущей продуктовой модели как будто она уже реализована. В интерфейсе можно заложить навигацию и UX для обучения, экзамена, модерации, рейтинга и тематик, но реальные экраны первой версии должны опираться на текущие backend endpoint'ы.

