# Project Overview

## Что это за проект

`teglish` - backend для платформы изучения английского языка. Текущая реализация сосредоточена на API для:

- регистрации и логина пользователей;
- разграничения ролей;
- создания, чтения, обновления и удаления упражнений;
- загрузки и выдачи медиа для диктантов.

Технологический стек:

- Python 3.13
- FastAPI
- SQLAlchemy Async
- PostgreSQL
- Alembic
- JWT + `pwdlib[argon2]`

## Структура репозитория

```text
.
├── src/
│   ├── main.py
│   ├── config.py
│   ├── auth/
│   ├── users/
│   ├── exercises/
│   ├── media/
│   └── db/
├── alembic/
│   └── versions/
├── tests/
├── uploads/
├── postman/
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

## Архитектурный стиль

Код организован по доменам. В каждом домене обычно есть:

- `router.py` - HTTP endpoints;
- `schemas.py` - Pydantic-модели запроса и ответа;
- `service.py` - бизнес-логика;
- `repository.py` - доступ к данным;
- `models.py` - SQLAlchemy-модели.

Это достаточно чистое вертикальное разбиение для небольшого backend-сервиса.

## Точки входа

- `src/main.py` создает `FastAPI`-приложение и подключает роутеры.
- Роуты публикуются напрямую на префиксах:
  - `/auth`
  - `/users`
  - `/exercises`
  - `/media`

Поле `api_v1_prefix` в `src/config.py` существует, но в `src/main.py` сейчас не используется.

## Хранение медиа

Медиафайлы диктантов загружаются через `/media`, физически сохраняются в локальную директорию `uploads`, а метаданные хранятся в таблице `dictation_media_files`.

Важно: `MediaStorage` уже оформлен как абстракция, поэтому `LocalMediaStorage` в будущем можно заменить на S3-совместимое хранилище без изменения публичного API домена `exercises`.
