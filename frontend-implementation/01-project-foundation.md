# Этап 1. Project Foundation

## Цель

Создать базовое NextJS-приложение, готовое к разработке интерфейса Teglish: типизированное, стилизуемое через Tailwind, совместимое с shadcn/ui и изолированное от backend-кода.

## Предварительные решения

Рекомендуемая структура:

```text
frontend/
├── app/
├── components/
├── features/
├── lib/
├── styles/
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

NextJS должен использовать App Router. Pages Router не нужен, потому что проект новый и лучше сразу строить route groups, layouts и server/client boundaries явно.

## Работы

1. Создать frontend-приложение.

Команда после согласования структуры:

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir false
```

2. Подключить shadcn/ui.

Базовые компоненты, которые понадобятся сразу:

- `button`
- `input`
- `label`
- `textarea`
- `select`
- `card`
- `badge`
- `alert`
- `dialog`
- `dropdown-menu`
- `tabs`
- `table`
- `form`
- `sonner`
- `progress`
- `separator`
- `skeleton`

3. Настроить переменные окружения.

Минимальный набор:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Если frontend будет запускаться в Docker или через reverse proxy, `NEXT_PUBLIC_API_BASE_URL` должен задаваться окружением, а не быть захардкоженным.

4. Настроить абсолютные импорты.

Пример:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

5. Определить базовые директории по назначению.

```text
components/ui/          # shadcn components
components/layout/      # app shell, nav, header
features/auth/          # auth UI + hooks
features/exercises/     # exercise player and authoring
features/media/         # upload and media preview
features/quizzes/       # quiz builder and session UI
features/users/         # profile and role helpers
lib/api/                # API client, endpoint functions, types
lib/auth/               # token storage, auth guards
lib/config/             # env parsing
lib/errors/             # normalized API errors
```

6. Добавить единый форматтер и lint scripts.

Минимальные scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

## Архитектурные правила

- Все endpoint'ы backend вызываются только через `lib/api`.
- Компоненты экранов не должны самостоятельно собирать URL API.
- JWT не должен протекать в UI-компоненты, кроме auth boundary.
- shadcn-компоненты можно адаптировать, но не стоит смешивать бизнес-логику с `components/ui`.
- Все формы должны иметь клиентскую валидацию, повторяющую backend-ограничения.

## Результат этапа

Готовое frontend-приложение запускается через:

```bash
cd frontend
npm run dev
```

Страница `/` открывается, Tailwind работает, shadcn-компоненты рендерятся, env `NEXT_PUBLIC_API_BASE_URL` читается централизованно.

## Критерии готовности

- `npm run lint` проходит.
- `npm run typecheck` проходит.
- `npm run build` проходит.
- В `README` frontend-части описан локальный запуск рядом с backend.

