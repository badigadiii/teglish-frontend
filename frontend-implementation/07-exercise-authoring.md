# Этап 7. Exercise Authoring

## Цель

Реализовать создание и редактирование упражнений трех типов: grammar, translate, dictation.

## Backend-контракт

### Создание

```text
POST /exercises
Authorization: Bearer <token>
```

Доступ: любой активный авторизованный пользователь.

### Редактирование

```text
PATCH /exercises/{exercise_id}
Authorization: Bearer <token>
```

Доступ: автор упражнения, `admin`, `moderator`.

Ограничение: тип упражнения менять нельзя. При typed update `type` должен соответствовать существующему type.

### Удаление

```text
DELETE /exercises/{exercise_id}
Authorization: Bearer <token>
```

Доступ: автор упражнения, `admin`, `moderator`.

## Routes

```text
/exercises/new
/exercises/[id]/edit
```

Важное ограничение: обычный пользователь сейчас не может получить полное упражнение через `GET /exercises/{id}`, потому что этот endpoint staff-only. Поэтому edit screen для обычного автора не сможет загрузить существующее упражнение на текущем backend.

Практичный MVP:

- создание упражнения доступно всем авторизованным пользователям;
- редактирование через UI реализовать сначала для staff;
- для полноценного author edit нужен backend endpoint "get my exercise by id" или изменение прав `GET /exercises/{id}`.

## Form architecture

Создать общий container:

```text
features/exercises/components/exercise-form.tsx
```

Он содержит:

- `exercise_text`;
- `type`;
- type-specific payload section;
- submit actions.

Type-specific sections:

- `GrammarPayloadFields`
- `TranslatePayloadFields`
- `DictationPayloadFields`

## Grammar form

Payload:

```json
{
  "correct_answer": "is",
  "response_options": ["is", "are", "am"]
}
```

Поля:

- correct answer;
- response options as dynamic list.

Валидация:

- correct answer required;
- options can be empty;
- если options непустые, рекомендовать включить correct answer в список.

## Translate form

Payload:

```json
{
  "correct_answers": ["hello", "hi"],
  "response_options": ["hello", "goodbye"]
}
```

Поля:

- correct answers as dynamic list;
- response options as dynamic list.

Валидация:

- минимум один correct answer на frontend, хотя backend default допускает пустой список;
- options optional;
- удалить пустые строки перед отправкой.

Причина более строгой frontend-валидации: упражнение с пустым списком правильных переводов практически непроходимо.

## Dictation form

Payload:

```json
{
  "speech_text": "I am learning English",
  "media_filename": "clip_uuid.mp3"
}
```

Поля:

- exercise text;
- speech text;
- media upload/select current uploaded file.

Валидация:

- speech text required;
- media filename required;
- media preview available before submit.

## Submit payload rules

Для create:

```json
{
  "exercise_text": "...",
  "type": "grammar",
  "payload": { "...": "..." }
}
```

Для update:

```json
{
  "exercise_text": "...",
  "type": "grammar",
  "payload": { "...": "..." }
}
```

Если обновляется только текст:

```json
{
  "exercise_text": "New text"
}
```

Но UI проще и безопаснее отправлять полный typed payload при редактировании.

## After submit

После создания:

- показать success state;
- показать ID упражнения;
- дать ссылку `/exercises/{id}` для публичной проверки;
- дать кнопку "Создать квиз с этим упражнением" позже, после реализации quizzes.

После редактирования:

- показать success toast;
- invalidated queries;
- остаться на форме или вернуться к staff list.

## Результат этапа

Авторизованный пользователь может создать упражнение любого поддержанного типа. Staff может редактировать упражнения, если полный read endpoint доступен.

## Критерии готовности

- Payload каждого типа соответствует backend discriminated union.
- Нельзя отправить dictation без загруженного media.
- При `400 Unknown media filename` UI показывает ошибку рядом с media field.
- При `403` UI объясняет, что редактировать может автор или staff.

