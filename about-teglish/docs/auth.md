# Auth Domain

## Назначение

Домен `auth` отвечает за:

- регистрацию пользователя;
- выдачу JWT access token;
- проверку текущего пользователя;
- проверку активности пользователя;
- ролевой доступ.

## Файлы

- `src/auth/router.py`
- `src/auth/dependencies.py`
- `src/auth/security.py`
- `src/auth/schemas.py`

## API

### `POST /auth/register`

Создает пользователя через `UsersService`.

Особенности:

- принимает `username`, `password`, `name`;
- роль по умолчанию - `user`;
- пароль в ответ не возвращается;
- дубликат `username` приводит к `409 Conflict`.

### `POST /auth/token`

Логин через `OAuth2PasswordRequestForm`.

Особенности:

- ищет пользователя по `username`;
- проверяет пароль через `pwdlib`;
- при ошибке возвращает `401 Incorrect username or password`;
- в JWT кладет `sub`, `user_id`, `role`.

## Security и зависимости

`src/auth/dependencies.py` содержит три ключевые зависимости:

- `get_current_user` - декодирует JWT и поднимает пользователя из БД;
- `get_current_active_user` - дополнительно проверяет `is_active`;
- `require_roles` - фабрика зависимости для проверки множества ролей.

`oauth2_scheme` настроен на `tokenUrl="/auth/token"`.

## JWT и пароли

В `src/auth/security.py`:

- хеширование пароля выполняется через `PasswordHash.recommended()`;
- токен создается с `exp`;
- алгоритм и секрет берутся из `Settings`.

Есть технический долг:

- `JWT_SECRET_KEY` имеет небезопасный default `change-me-in-production`;
- `DUMMY_HASH` помечен `TODO`, но используется корректно для защиты от утечки по таймингу при несуществующем пользователе.

## Связь с другими доменами

- использует `UsersService` и `UsersRepository`;
- обеспечивает доступ для `users`, `exercises`, `media`;
- роли `admin` и `moderator` особенно важны в домене упражнений.
