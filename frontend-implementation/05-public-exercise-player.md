# Этап 5. Public Exercise Player

## Цель

Реализовать прохождение отдельного упражнения по публичным endpoint'ам без обязательной авторизации.

## Backend-контракт

### Получить вопрос

```text
GET /exercises/{exercise_id}/question
```

Ответ для `grammar` и `translate`:

```json
{
  "type": "grammar",
  "exercise_text": "Choose the correct word",
  "response_options": ["is", "are", "am"]
}
```

Ответ для `dictation`:

```json
{
  "type": "dictation",
  "exercise_text": "Listen and write what you hear",
  "media_url": "/media/example.mp3"
}
```

### Проверить ответ

```text
POST /exercises/{exercise_id}/perform
Content-Type: application/json
```

Payload:

```json
{
  "type": "grammar",
  "answer": "is"
}
```

Ответ:

```json
{
  "message": "ok"
}
```

или:

```json
{
  "message": "wrong answer"
}
```

## UI route

```text
/exercises/[id]
```

## Exercise renderer

Создать общий компонент:

```text
features/exercises/components/exercise-player.tsx
```

Он должен выбирать renderer по `question.type`:

- `grammar`: choices + text input fallback;
- `translate`: choices + text input fallback;
- `dictation`: media player + text area.

## Grammar UX

Если `response_options` непустой:

- показать варианты как большие buttons/cards;
- выбранный вариант можно отправить сразу или через кнопку Submit;
- оставить возможность ручного ответа не обязательно для MVP, но полезно, если options пустые.

Если `response_options` пустой:

- показать text input.

## Translate UX

Если `response_options` непустой:

- показать варианты ответа;
- дополнительно можно дать manual input, потому что backend поддерживает список правильных ответов, а options могут быть подсказками.

Если options пустые:

- text input.

## Dictation UX

Компоненты:

- audio/video player;
- replay button, если используется custom control;
- text area;
- submit button;
- hint text о нормализации: регистр, пробелы и пунктуация backend игнорирует частично для dictation.

Важно: backend возвращает `media_url`, который может быть относительным. Frontend должен нормализовать его через API base URL.

## Feedback states

Для всех типов:

- pending submit;
- correct;
- wrong;
- network error;
- not found.

Correct/wrong должны быть явно текстовыми:

- Correct: "Ответ верный".
- Wrong: "Ответ неверный".

Не полагаться только на цвет.

## Edge cases

- `404`: упражнение не найдено.
- `400 Exercise type mismatch`: frontend отправил неверный type, это баг UI/API layer.
- пустой ответ: блокировать отправку на frontend.
- repeated submit: disabled state во время mutation.

## Результат этапа

Любой пользователь может открыть `/exercises/{id}`, получить безопасную версию вопроса и проверить ответ без логина.

## Критерии готовности

- `grammar`, `translate`, `dictation` рендерятся разными UI.
- Правильные ответы не отображаются в question UI.
- `media_url` корректно работает как для относительного, так и для абсолютного URL.
- TypeScript discriminated union покрывает все exercise type.

