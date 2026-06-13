# Creator Flow Frontend Roadmap

## Goal

Implement the creator experience for profile, personal content management, exercise creation, media upload, and quiz creation.

This flow should replace the mock creator/profile behavior from `about-teglish/teglish-example.html` with real backend integration.

## Product Scope

In scope for MVP:

- Profile overview from `GET /users/me`.
- Personal lists:
  - my exercises;
  - my quizzes;
  - my media;
  - my quiz sessions.
- Create, edit, and delete exercises.
- Upload and delete media files for dictation exercises.
- Create, edit, and delete quizzes from selected exercise IDs.
- Public/private flag for exercises and quizzes.
- Quiz builder ordering through the order of selected `exercise_ids`.

Out of scope for MVP:

- Rich moderation workflow.
- Thematic collections.
- Rating and scoring economy.
- Advanced media clipping or subtitle-based extraction.
- AI/Yandex-assisted translation generation.
- Exam/training mode configuration.

## Backend Contract

### Profile and Personal Lists

Authenticated endpoints:

- `GET /users/me`
- `GET /users/me/exercises`
- `GET /users/me/quizzes`
- `GET /users/me/media?page=1&size=10`
- `GET /users/me/quizzes/sessions/my?page=1&size=10`
- `GET /users/me/quizzes/{quiz_id}/sessions/my?page=1&size=10`

Use these endpoints for profile tabs instead of filtering public catalogs on the client.

### Media

`POST /media`

- Requires authentication.
- Accepts `multipart/form-data`.
- Supports only `audio/*` and `video/*`.
- Optional `name` field.
- Returns `author_id`, `media_filename`, `extension`, `media_url`.

`DELETE /media/{media_filename}`

- Allowed for owner, `admin`, or `moderator`.
- Returns `204`.

### Exercises

`POST /exercises`

Shared fields:

```json
{
  "exercise_text": "Translate the phrase",
  "public": false,
  "type": "translate",
  "payload": {}
}
```

Exercise types:

```json
{
  "type": "grammar",
  "payload": {
    "correct_answer": "is",
    "response_options": ["is", "are", "am", "be"]
  }
}
```

```json
{
  "type": "translate",
  "payload": {
    "correct_answers": ["I need help"],
    "response_options": ["I need help", "I need a help", "I am need help"]
  }
}
```

```json
{
  "type": "dictation",
  "payload": {
    "speech_text": "I need a little more time",
    "media_filename": "movie_scene_audio.mp3"
  }
}
```

Important behavior:

- Dictation `media_filename` must exist, otherwise backend returns `400 Unknown media filename`.
- Exercise `type` cannot be changed through `PATCH`.
- Typed payload update requires `type`.
- `GET /exercises` is intended for staff/admin, not normal creator lists.

### Quizzes

`POST /quizzes`

```json
{
  "title": "Movie phrases",
  "description": "Short quiz from my exercises",
  "exercise_ids": [12, 15, 18],
  "public": false
}
```

Important behavior:

- `title`: 1-200 chars.
- `exercise_ids`: at least one item.
- The order of `exercise_ids` determines quiz order.
- Quiz stores references to exercises, not duplicated exercise text.

## Frontend Architecture

Recommended file structure:

```text
src/
  app/
    (app)/
      profile/
        page.tsx
        exercises/page.tsx
        quizzes/page.tsx
        media/page.tsx
        attempts/page.tsx
      creator/
        page.tsx
        exercises/new/page.tsx
        exercises/[exerciseId]/edit/page.tsx
        quizzes/new/page.tsx
        quizzes/[quizId]/edit/page.tsx
    api/
      exercises/
        route.ts
        [exerciseId]/route.ts
      media/
        route.ts
        [mediaFilename]/route.ts
      quizzes/
        route.ts
        [quizId]/route.ts
      users/
        me/
          exercises/route.ts
          quizzes/route.ts
          media/route.ts
          quiz-sessions/route.ts
  features/
    creator/
      exercises/
        api.ts
        schemas.ts
        types.ts
        components/
          exercise-type-tabs.tsx
          exercise-form.tsx
          exercise-preview.tsx
          exercise-list.tsx
      media/
        api.ts
        schemas.ts
        components/
          media-upload-form.tsx
          media-picker.tsx
          media-list.tsx
      quizzes/
        api.ts
        schemas.ts
        types.ts
        components/
          quiz-form.tsx
          exercise-picker.tsx
          selected-exercise-order.tsx
          quiz-preview.tsx
    profile/
      components/
        profile-summary.tsx
        profile-tabs.tsx
```

Route handlers should attach the session cookie token as `Authorization: Bearer <token>` when calling the backend.

## UX Direction

Use the draft HTML as flow inspiration:

- top navigation with `Create`;
- profile dropdown with personal sections;
- creator mode switch: exercise or quiz;
- exercise type tabs: translation, grammar, dictation;
- live student-facing preview;
- quiz builder with available exercises on the left and selected ordered exercises on the right.

Refinements for real API:

- Show persisted server data, not local mock state.
- Make dictation media selection explicit before exercise save.
- Show private/public status as an editable field.
- Show delete confirmations for exercises, quizzes, and media.
- Use optimistic UI only where rollback is straightforward.

## Roadmap

### Phase 1: Creator API Layer

- Create typed clients for:
  - personal exercise list;
  - exercise CRUD;
  - personal quiz list;
  - quiz CRUD;
  - personal media list;
  - media upload/delete;
  - personal quiz sessions.
- Create Zod schemas matching backend payloads.
- Normalize paginated responses with `items`, `total`, `page`, `size`, `pages`.
- Standardize error mapping for:
  - `400 Unknown media filename`;
  - `401` unauthenticated;
  - `403` not owner/not allowed;
  - `404` not found;
  - `422` validation.

Acceptance criteria:

- All creator API functions are typed.
- Route handlers never expose the JWT to client components.
- Query keys are stable and grouped by domain.

### Phase 2: Profile Workspace

- Build profile overview from `GET /users/me`.
- Build profile tabs/pages:
  - personal data;
  - my exercises;
  - my quizzes;
  - my media;
  - my quiz attempts.
- Use `GET /users/me/exercises` and `GET /users/me/quizzes` for creator-owned content.
- Use paginated UI for media and session history.
- Add empty states that guide to create an exercise or quiz.

Acceptance criteria:

- Profile never depends on mock counters.
- Empty account shows useful empty states.
- Unauthorized access redirects to onboarding.

### Phase 3: Exercise Creation

- Build exercise type switch with three supported types:
  - `translate`;
  - `grammar`;
  - `dictation`.
- Build shared fields:
  - `exercise_text`;
  - `public`.
- Build type-specific fields:
  - grammar: `correct_answer`, `response_options`;
  - translate: `correct_answers`, `response_options`;
  - dictation: `speech_text`, `media_filename`.
- Parse multi-value fields as newline-separated lists or chips.
- Validate client-side before submit:
  - grammar requires `correct_answer`;
  - dictation requires `speech_text` and existing media;
  - quiz/public status is boolean, not display text.
- Submit to `POST /exercises`.
- Invalidate personal exercises and public exercises if saved as public.

Acceptance criteria:

- Each exercise type saves a valid backend payload.
- Dictation cannot be saved without selected uploaded media.
- Successful save returns user to personal exercise list or quiz builder based on entry action.

### Phase 4: Media Workflow

- Build media upload form for audio/video.
- Allow optional display name that maps to backend `name`.
- Show upload progress while request is pending.
- Render media list with filename, extension, and media URL.
- Add inline media preview:
  - audio player for audio;
  - video player for video.
- Add delete action with confirmation.
- Integrate media picker into dictation exercise form.

Acceptance criteria:

- Upload rejects unsupported file types before request when possible.
- Backend media errors are displayed clearly.
- Deleted media disappears from picker and media list.

### Phase 5: Exercise Editing and Deletion

- Build edit page for existing exercise.
- Do not allow changing exercise `type`.
- For typed payload updates, include `type` with `payload`.
- Add delete action from exercise list and edit page.
- Handle `403` for attempts to edit or delete someone else's exercise.

Acceptance criteria:

- Existing exercise can be updated without changing type.
- Delete removes item from personal exercise list.
- Ownership errors do not leave stale optimistic UI.

### Phase 6: Quiz Builder

- Build quiz metadata form:
  - `title`;
  - `description`;
  - `public`.
- Load available exercises from `GET /users/me/exercises`.
- Let creator add exercises into a selected list.
- Support reordering selected exercises.
- Submit `exercise_ids` in selected order to `POST /quizzes`.
- Require at least one selected exercise.
- Invalidate personal quizzes and public quizzes if saved as public.

Acceptance criteria:

- Quiz can be created from one or more owned exercises.
- Selected order is preserved in the submitted `exercise_ids`.
- Empty quiz cannot be submitted.

### Phase 7: Quiz Editing and Deletion

- Build edit page for existing quiz.
- Load quiz details through `GET /quizzes/{quiz_id}`.
- Allow updating title, description, public status, and exercise IDs.
- Add delete action with confirmation.
- Handle `403` and `404`.

Acceptance criteria:

- Creator can revise quiz metadata and composition.
- Deleting a quiz removes it from personal list.
- Private quiz does not appear in public catalog.

### Phase 8: Tests

- Add Playwright scenario: create translation exercise.
- Add Playwright scenario: upload media and create dictation exercise.
- Add Playwright scenario: create quiz from selected exercises and verify it appears in my quizzes.
- Add Playwright scenario: edit exercise without changing type.
- Add Playwright scenario: delete own quiz.
- Add negative scenario: dictation with unknown media shows backend error.

Verification commands:

```bash
pnpm lint
pnpm typecheck
pnpm e2e
```

## Dependencies

- Onboarding/session layer must be implemented first.
- Backend media storage must be writable in local/e2e environment.
- Test fixtures need at least one authenticated user.
- Quiz builder depends on personal exercises being available.

## Risks and Decisions

- Public catalog is not the right source for creator-owned content. Use `/users/me/*`.
- Quiz stores only exercise IDs. Frontend preview can display exercise text from loaded personal exercises, but submitted payload must remain IDs.
- Dictation media references are filename-based. Deleting media that is still used by an exercise may create broken playback unless backend prevents it later.
- Backend currently has roles, but normal creator flow should work for `user` role.

