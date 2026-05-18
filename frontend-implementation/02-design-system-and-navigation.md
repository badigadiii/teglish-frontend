# Этап 2. Design System And Navigation

## Цель

Создать визуальный фундамент и навигационную структуру, чтобы все последующие фичи добавлялись в предсказуемый интерфейс без разрозненных экранов.

## Продуктовая рамка

Teglish не должен выглядеть как универсальная admin-панель. Это образовательный продукт с двумя режимами восприятия:

- learner experience: прохождение упражнений, квизов, прогресс, понятная обратная связь;
- author/staff experience: создание контента, работа с медиа, проверка и управление.

Первая версия должна визуально разделять эти сценарии.

## Маршрутная карта

Рекомендуемые маршруты:

```text
/                         # landing/dashboard redirect
/login                    # логин
/register                 # регистрация
/profile                  # текущий пользователь

/exercises/[id]           # публичное прохождение отдельного упражнения
/exercises/new            # создание упражнения, auth required
/exercises/[id]/edit      # редактирование упражнения, auth required

/quizzes/[id]             # карточка квиза, auth required
/quizzes/[id]/start       # старт прохождения, auth required
/quiz-sessions/[id]       # активная или завершенная сессия
/quizzes/new              # создание квиза, auth required
/quizzes/[id]/edit        # редактирование квиза, auth required

/staff                    # staff dashboard
/staff/exercises          # список упражнений для admin/moderator
/staff/quizzes            # список квизов для admin/moderator
/staff/media              # загрузка/проверка медиа
```

Важно: публичного каталога упражнений и квизов в backend сейчас нет. Поэтому `/staff/exercises` и `/staff/quizzes` можно реализовать на текущем API, а learner discovery для обычного пользователя потребует отдельного backend endpoint'а.

## Layout

Нужно создать три layout-слоя:

1. Public layout.

Используется для `/`, `/login`, `/register`, публичного `/exercises/[id]`.

2. App layout.

Используется для авторизованных learner-сценариев: профиль, квизы, прохождение сессий, создание контента.

3. Staff layout.

Используется для `admin` и `moderator`. Должен явно показывать роль и staff-контекст, чтобы пользователь не путал создание контента с прохождением.

## Визуальная система

Tailwind theme должен определить:

- semantic colors: `background`, `surface`, `primary`, `accent`, `success`, `warning`, `danger`;
- radius tokens;
- spacing rhythm;
- card shadows;
- typography scale.

Для образовательного интерфейса рекомендуется:

- крупные карточки вопросов;
- ясные состояния correct/wrong;
- спокойная цветовая палитра без перегруженности;
- отдельный визуальный акцент для media/dictation;
- progress indicators в quiz-сценариях.

## Базовые компоненты layout

Создать:

- `AppHeader`: логотип, текущий пользователь, auth actions.
- `MainNav`: основные learner-разделы.
- `StaffNav`: staff-разделы.
- `PageHeader`: title, description, actions.
- `EmptyState`: пустые списки и недоступные фичи.
- `ErrorState`: нормализованная ошибка API.
- `LoadingState`: skeleton для списков и форм.
- `RoleGate`: скрытие/показ UI по роли.

## Accessibility

Обязательные требования:

- формы имеют `label`;
- ошибки формы связаны с полями;
- интерактивные элементы доступны с клавиатуры;
- audio/video controls доступны через стандартные HTML controls;
- toast не является единственным источником критичной информации;
- цвет correct/wrong дублируется текстом.

## Результат этапа

Приложение имеет готовую навигационную оболочку, базовые layouts и shadcn-адаптацию. Даже без бизнес-функций пользователь должен понимать, где он находится: learner, author или staff context.

## Критерии готовности

- Все маршруты-заглушки открываются без runtime errors.
- Header корректно меняется для гостя и авторизованного пользователя.
- Staff navigation скрыта для обычного пользователя.
- Mobile navigation работает без горизонтального скролла.

