# DB Domain

## Назначение

Формально отдельного бизнес-домена `db` нет, но в проекте есть инфраструктурный слой для базы данных и миграций, который влияет на все остальные домены.

## Файлы

- `src/db/base.py`
- `src/db/db_helper.py`
- `alembic/env.py`
- `alembic/versions/*.py`
- `alembic.ini`

## Текущее устройство

`src/db/base.py` определяет общий `DeclarativeBase`.

`src/db/db_helper.py` определяет:

- `engine` через `create_async_engine(settings.db_url)`;
- `SessionLocal` через `async_sessionmaker`;
- dependency `get_session()` для FastAPI.

## Конфигурация

Подключение к PostgreSQL задается через `.env`:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `JWT_SECRET_KEY`
- `BOOTSTRAP_ADMIN_PASSWORD_HASH`

## Тестовая инфраструктура

Тесты поднимают отдельную БД, чистят таблицы между кейсами и запускают `uvicorn` как отдельный процесс. Это не отдельный домен, но важная часть инфраструктуры текущего проекта.
