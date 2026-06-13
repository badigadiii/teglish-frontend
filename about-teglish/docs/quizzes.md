# Quizzes Domain

## Назначение

Домен `quizzes` объединяет существующие упражнения в последовательные квизы и хранит сессии их прохождения.

## Файлы

- `src/quizzes/models.py`
- `src/quizzes/schemas.py`
- `src/quizzes/repository.py`
- `src/quizzes/service.py`
- `src/quizzes/router.py`

## Модель данных

В домене используются три связанные сущности:

- `quizzes` - сам квиз: `id`, `author_id`, `title`, `description`
- `quiz_exercises` - состав квиза: `quiz_id`, `exercise_id`, `order_index`
- `quiz_sessions` - сессия прохождения: `quiz_id`, `user_id`, `status`, `total_questions`, `answered_questions`, `correct_answers`, `started_at`, `finished_at`
- `quiz_attempts` - последний сохраненный ответ по упражнению в рамках сессии

Квиз хранит только ссылки на `exercises`, а порядок прохождения задается через `order_index`.

## Сессии прохождения

При старте создается новая `quiz_session` со статусом `active`.

Сервис возвращает список вопросов в порядке `quiz_exercises.order_index`. Для каждого упражнения используется публичное question-представление из домена `exercises`, поэтому правильные ответы не раскрываются.

Ответ на вопрос сохраняется в `quiz_attempts`. Если пользователь отвечает на то же упражнение повторно, старая попытка перезаписывается, а счетчики `answered_questions` и `correct_answers` пересчитываются.

Сессию может изменять только ее владелец. Читать сессию могут:

- владелец сессии;
- автор квиза;
- `admin`;
- `moderator`.

После `finish` сессия получает статус `finished`, а дальнейшие ответы запрещены.

## Связь с exercises

Домен `quizzes` полностью опирается на `exercises`:

- валидирует существование `exercise_ids`;
- использует `ExercisesService.get_exercise_question()` для выдачи вопросов;
- использует `ExercisesService.evaluate_exercise_answer()` для проверки ответов.

Из-за этого вся логика нормализации ответа определяется типом упражнения. Например, для `translate` сохраняется поведение домена `exercises`, включая нормализацию регистра и пробелов.

В отличие от публичного `/exercises/{id}/perform`, quiz answer endpoint не принимает `type` в payload, потому что тип уже однозначно определяется по `exercise_id` внутри сессии.
