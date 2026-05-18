# Этап 8. Quizzes And Sessions

## Цель

Реализовать создание квизов из упражнений и прохождение quiz sessions.

## Backend-контракт

### Quiz model

```json
{
  "id": 1,
  "author_id": 1,
  "title": "Basic grammar",
  "description": "Short practice",
  "exercise_ids": [1, 2, 3]
}
```

### Создание

```text
POST /quizzes
Authorization: Bearer <token>
```

Payload:

```json
{
  "title": "Basic grammar",
  "description": "Short practice",
  "exercise_ids": [1, 2, 3]
}
```

Ограничения:

- title 1-200 символов;
- exercise_ids непустой;
- exercise_ids уникальные;
- все exercise_ids должны существовать.

### Получение квиза

```text
GET /quizzes/{quiz_id}
Authorization: Bearer <token>
```

Доступ: любой авторизованный пользователь.

### Старт сессии

```text
POST /quizzes/{quiz_id}/perform/start
Authorization: Bearer <token>
```

Ответ содержит session fields и `questions`.

### Ответ

```text
POST /quizzes/sessions/{session_id}/answer
Authorization: Bearer <token>
```

Payload:

```json
{
  "exercise_id": 1,
  "answer": "is"
}
```

В отличие от `/exercises/{id}/perform`, type отправлять не нужно.

### Завершение

```text
POST /quizzes/sessions/{session_id}/finish
Authorization: Bearer <token>
```

## Routes

```text
/quizzes/new
/quizzes/[id]
/quizzes/[id]/edit
/quizzes/[id]/start
/quiz-sessions/[id]
```

## Quiz builder

Проблема текущего backend: обычный пользователь не имеет endpoint'а списка доступных упражнений. `GET /exercises` staff-only.

MVP-варианты:

- для staff: выбирать упражнения из `/exercises`;
- для обычного пользователя: вводить exercise IDs вручную;
- после backend-доработки: заменить manual IDs на searchable picker.

Рекомендуемый MVP:

- staff получает полноценный picker;
- user получает форму с chips/ID input и предупреждением, что упражнение должно существовать.

## Quiz detail page

`/quizzes/[id]` показывает:

- title;
- description;
- count of exercises;
- exercise IDs;
- start button;
- edit/delete actions, если пользователь автор или staff. Сейчас frontend не знает author ownership кроме `author_id` и current user id, этого достаточно для UI.

## Start flow

`/quizzes/[id]/start`:

1. вызывает `POST /quizzes/{id}/perform/start`;
2. сохраняет returned session id;
3. показывает первый вопрос;
4. позволяет отвечать по одному вопросу;
5. отображает progress: answered / total.

Можно также redirect на:

```text
/quiz-sessions/{session_id}
```

и передать questions через query cache. Если открыть session detail позже, backend возвращает attempts, но не возвращает questions. Поэтому для active player лучше держать questions из start response в state/cache.

## Session player

Компоненты:

- `QuizProgress`;
- `QuizQuestionStepper`;
- `QuizAnswerForm`;
- `QuizResultSummary`.

Поведение:

- answer endpoint можно вызывать повторно для того же exercise_id, backend перезаписывает attempt;
- счетчики `answered_questions` и `correct_answers` приходят в ответе;
- после finish дальнейшие ответы запрещены backend'ом.

## Training vs exam mode

В product docs есть режимы:

- тренировочный: ошибки сразу;
- экзамен: ошибки только в конце.

Текущий backend всегда возвращает `is_correct` после ответа. Настоящий exam mode backend не поддерживает.

Frontend MVP:

- реализовать только training mode;
- не обещать exam mode как рабочий;
- можно оставить disabled toggle "Exam mode requires backend support".

## Session detail

`GET /quizzes/sessions/{id}` возвращает:

- session counters;
- status;
- attempts.

Использовать для:

- result page после finish;
- просмотра истории конкретной сессии по ссылке.

Ограничение: нет endpoint'а списка сессий пользователя, поэтому "history page" пока невозможна без backend-доработки.

## Результат этапа

Пользователь может создать квиз, открыть квиз, стартовать сессию, ответить на вопросы и завершить прохождение.

## Критерии готовности

- `exercise_ids` валидируются на уникальность до отправки.
- Start response рендерит все question types.
- Answer request не отправляет `type`.
- Finish переводит UI в read-only result state.
- Повторный ответ на вопрос обновляет локальный результат, а не создает дубликат UI.

