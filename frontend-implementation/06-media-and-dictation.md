# Этап 6. Media And Dictation

## Цель

Реализовать загрузку audio/video файлов для диктантов и удобный UX выбора загруженного медиа при создании dictation exercise.

## Backend-контракт

### Загрузка

```text
POST /media
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Form fields:

- `file`: required;
- `name`: optional.

Ответ:

```json
{
  "media_filename": "clip_uuid.mp3",
  "extension": ".mp3",
  "media_url": "/media/clip_uuid.mp3"
}
```

Ограничения:

- только авторизованный пользователь;
- только `audio/*` и `video/*`;
- файл должен иметь расширение;
- backend нормализует `name` и добавляет UUID suffix.

### Получение файла

```text
GET /media/{media_filename}
```

## Важное backend-ограничение

Сейчас нет endpoint'а списка загруженных media. Это значит:

- frontend может использовать только media, загруженное в текущей форме;
- для выбора из библиотеки нужен новый backend endpoint;
- staff media page может быть ограничена upload-only MVP.

## UI components

Создать:

- `MediaUploadField`: выбор файла, optional display name, upload action.
- `MediaPreview`: audio/video preview по `media_url`.
- `MediaFilenameBadge`: показывает `media_filename` для вставки в dictation payload.

## Upload UX

Поля:

- file input;
- optional name;
- upload button.

Состояния:

- idle;
- selected;
- uploading;
- uploaded;
- rejected by frontend MIME check;
- backend error.

Frontend MIME check:

- разрешить `audio/*`;
- разрешить `video/*`;
- показать ошибку до отправки, если тип явно неподходящий.

Это не заменяет backend-проверку.

## Интеграция с dictation exercise

В форме создания dictation:

- сначала загрузить файл через `MediaUploadField`;
- после успеха сохранить `media_filename`;
- показать preview;
- подставить `media_filename` в payload.

Payload для создания:

```json
{
  "type": "dictation",
  "exercise_text": "Listen and write the phrase",
  "payload": {
    "speech_text": "Actual phrase",
    "media_filename": "clip_uuid.mp3"
  }
}
```

## Staff media page

Маршрут:

```text
/staff/media
```

MVP-состав:

- upload form;
- last uploaded media preview;
- copy filename action;
- объяснение, что списка медиа пока нет из-за backend limitation.

После добавления backend endpoint'а:

- media table;
- фильтр audio/video;
- preview;
- delete/replace policy, если появится backend support.

## Результат этапа

Пользователь может загрузить audio/video и использовать `media_filename` при создании dictation exercise. При прохождении dictation media корректно проигрывается.

## Критерии готовности

- FormData upload работает с Bearer token.
- Неверный MIME type блокируется на frontend и backend.
- После upload preview открывает файл через `/media/{media_filename}`.
- Dictation create form не отправляется без `media_filename`.

