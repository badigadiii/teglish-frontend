# Этап 9. Staff And Admin Flows

## Цель

Реализовать рабочие экраны для `admin` и `moderator`, которые используют закрытые backend endpoint'ы.

## Роли

Backend роли:

- `admin`
- `moderator`
- `user`

Staff-доступ:

- `admin`
- `moderator`

Frontend должен использовать роли только для UX. Реальная авторизация остается на backend.

## Staff dashboard

Маршрут:

```text
/staff
```

Содержимое:

- быстрые ссылки на exercises, quizzes, media;
- текущая роль;
- предупреждения о backend limitations;
- последние действия можно добавить только после появления history/audit endpoint'ов.

## Staff exercises list

Маршрут:

```text
/staff/exercises
```

Backend:

```text
GET /exercises
Authorization: Bearer <token>
```

Список должен показывать:

- id;
- type;
- exercise_text;
- author_id;
- quick link to public question `/exercises/{id}`;
- edit action;
- delete action.

Фильтры на frontend:

- type;
- author_id;
- search by exercise_text.

Так как backend не поддерживает pagination/search, фильтрация MVP будет client-side.

Риск: при большом количестве упражнений нужен backend pagination.

## Staff exercise details

Маршрут:

```text
/staff/exercises/[id]
```

Backend:

```text
GET /exercises/{id}
```

Показывать полный payload, включая правильные ответы. Эту страницу нельзя делать публичной.

## Staff quizzes list

Маршрут:

```text
/staff/quizzes
```

Backend:

```text
GET /quizzes
Authorization: Bearer <token>
```

Список должен показывать:

- id;
- title;
- description;
- author_id;
- exercise count;
- edit action;
- delete action;
- start as learner action.

Client-side filters:

- author_id;
- title search.

## Delete UX

Для удаления exercises и quizzes использовать confirmation dialog.

Текст должен явно указывать:

- ID сущности;
- действие необратимо;
- возможны связи с квизами.

Backend может вернуть conflict-like или generic error, если удаление нарушит ограничения. UI должен показать backend message.

## Moderation future

Product docs говорят, что пользовательские задания должны проходить модерацию. Текущий backend не содержит:

- moderation status;
- approve/reject endpoint;
- public catalog;
- review queue.

Поэтому в staff UI нельзя реализовывать настоящую модерацию. Можно создать секцию "Moderation" как disabled/future area, но не имитировать workflow.

Для полноценной модерации потребуется backend:

- поле `status`: `draft`, `pending`, `approved`, `rejected`;
- endpoint submit for review;
- endpoint approve/reject;
- фильтр по status;
- reason/comment для rejection.

## Результат этапа

Staff-пользователь получает рабочую панель управления текущими упражнениями, квизами и загрузкой медиа.

## Критерии готовности

- `/staff/*` недоступны обычному пользователю на UI level.
- При прямом заходе обычный пользователь получает понятное `403` состояние.
- Staff list корректно обрабатывает пустой список.
- Delete требует подтверждения и invalidates list query.
- Полные правильные ответы отображаются только в staff area.

