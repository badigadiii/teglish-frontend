# Student Flow Frontend Roadmap

## Goal

Implement the student experience for browsing public content, performing standalone exercises, taking quizzes, answering questions, finishing sessions, and reviewing results.

This flow should replace the mock catalog/quiz player from `about-teglish/teglish-example.html` with real backend quiz sessions and exercise evaluation.

## Product Scope

In scope for MVP:

- Public quiz catalog.
- Public exercise catalog.
- Public quiz detail.
- Authenticated quiz start.
- Quiz player for `translate`, `grammar`, and `dictation`.
- Per-question answer submission.
- Finish quiz session and show result.
- Standalone public exercise player through `/exercises/{id}/perform`.
- Student history from personal quiz session endpoints.

Out of scope for MVP:

- Exam mode with delayed feedback.
- Thematic recommendations.
- Ratings and points.
- Leaderboards.
- Offline mode.
- Adaptive difficulty.

## Backend Contract

### Public Catalogs

`GET /quizzes/public?page=1&size=20`

Returns paginated public quizzes.

`GET /quizzes/public/{quiz_id}`

Returns public quiz detail.

Private quiz through public detail should return `404`.

`GET /exercises/public?page=1&size=20`

Returns paginated public exercises with public question representation.

### Standalone Exercises

`GET /exercises/{exercise_id}/question`

Returns student-safe question data:

```json
{
  "type": "translate",
  "exercise_text": "Translate the phrase",
  "response_options": ["I need help", "I need a help"]
}
```

or:

```json
{
  "type": "dictation",
  "exercise_text": "Listen and type the phrase",
  "media_url": "/media/movie_scene_audio.mp3"
}
```

`POST /exercises/{exercise_id}/perform`

Request examples:

```json
{
  "type": "grammar",
  "answer": "is"
}
```

```json
{
  "type": "translate",
  "answer": "I need help"
}
```

```json
{
  "type": "dictation",
  "answer": "I need a little more time"
}
```

Response:

```json
{
  "message": "ok"
}
```

or:

```json
{
  "message": "wrong answer"
}
```

### Quiz Sessions

`POST /quizzes/{quiz_id}/start`

Requires authentication. Returns:

- session id;
- quiz id;
- user id;
- status;
- counters;
- ordered `questions`.

`POST /quizzes/sessions/{session_id}/answer`

Request:

```json
{
  "exercise_id": 12,
  "answer": "I need help"
}
```

Response:

```json
{
  "exercise_id": 12,
  "is_correct": true,
  "answered_questions": 1,
  "correct_answers": 1
}
```

Important behavior:

- Answering the same exercise again overwrites the previous attempt.
- Backend recalculates counters.
- After session `finish`, further answers are forbidden.

`POST /quizzes/sessions/{session_id}/finish`

Finishes the active session.

`GET /quizzes/sessions/{session_id}`

Readable by:

- session owner;
- quiz author;
- `admin`;
- `moderator`.

Personal history:

- `GET /users/me/quizzes/sessions/my?page=1&size=10`
- `GET /users/me/quizzes/{quiz_id}/sessions/my?page=1&size=10`

## Frontend Architecture

Recommended file structure:

```text
src/
  app/
    (app)/
      quizzes/
        page.tsx
        [quizId]/page.tsx
        [quizId]/play/page.tsx
      exercises/
        page.tsx
        [exerciseId]/play/page.tsx
      results/
        quiz-sessions/[sessionId]/page.tsx
    api/
      public/
        quizzes/route.ts
        quizzes/[quizId]/route.ts
        exercises/route.ts
      exercises/
        [exerciseId]/
          question/route.ts
          perform/route.ts
      quizzes/
        [quizId]/start/route.ts
        sessions/
          [sessionId]/
            answer/route.ts
            finish/route.ts
            route.ts
  features/
    student/
      catalog/
        api.ts
        components/
          quiz-card.tsx
          exercise-card.tsx
          catalog-pagination.tsx
      player/
        types.ts
        answer-schemas.ts
        components/
          question-renderer.tsx
          choice-answer.tsx
          text-answer.tsx
          dictation-answer.tsx
          quiz-progress.tsx
          quiz-feedback.tsx
      results/
        components/
          quiz-result-summary.tsx
          session-attempts.tsx
```

## UX Direction

Use the example HTML as a baseline for the student flow:

- catalog cards for public quizzes;
- quiz player with progress bar;
- side panel with answered/correct/remaining counters;
- immediate feedback after each answer in training MVP;
- result screen with correct count and percentage;
- profile history for completed and active sessions.

Refinements for real API:

- Public catalog should come from `/quizzes/public`.
- Quiz player should start from backend session, not local mock quiz state.
- Counters should use backend `answered_questions` and `correct_answers`.
- Dictation player should use `media_url` from backend.
- Finished sessions should be read-only.

## Roadmap

### Phase 1: Student API Layer

- Create typed clients for:
  - public quizzes;
  - public quiz detail;
  - public exercises;
  - exercise question;
  - standalone exercise perform;
  - quiz start;
  - quiz answer;
  - quiz finish;
  - quiz session detail;
  - my quiz session history.
- Create question union types:
  - choice question for `translate` and `grammar`;
  - dictation question for `dictation`.
- Create answer schemas:
  - standalone perform requires `type` and `answer`;
  - quiz answer requires `exercise_id` and `answer`.
- Normalize paginated catalog responses.

Acceptance criteria:

- Public pages can load without authentication where backend permits it.
- Quiz start and quiz answer require session cookie.
- API layer prevents leaking correct answers into question UI.

### Phase 2: Public Catalog

- Build quiz catalog page from `GET /quizzes/public`.
- Build exercise catalog page from `GET /exercises/public`.
- Add pagination with `page` and `size`.
- Add cards showing:
  - title/description for quizzes;
  - type and exercise text for exercises;
  - public status only where useful.
- Add empty and loading states.

Acceptance criteria:

- Catalog renders backend data.
- Pagination updates URL state or query state predictably.
- Private content is not shown through public endpoints.

### Phase 3: Quiz Detail and Start

- Build public quiz detail page from `GET /quizzes/public/{quiz_id}`.
- Show title, description, and exercise count when available.
- Add primary action to start quiz.
- If unauthenticated, route user to onboarding/login and preserve intended quiz URL.
- If authenticated, call `POST /quizzes/{quiz_id}/start`.
- Store returned session state in query cache and navigate to player.

Acceptance criteria:

- Authenticated user can start a public quiz.
- Unauthenticated user is not allowed to start and is sent to login.
- `404` private/missing quiz shows not-found state.

### Phase 4: Quiz Player

- Render questions from `QuizStartResponse.questions` in backend order.
- Build one renderer per question shape:
  - choice buttons for grammar/translate when `response_options` exists;
  - text input for translate without useful options;
  - audio/video player plus text input for dictation.
- Submit answers through `POST /quizzes/sessions/{session_id}/answer`.
- Update counters from backend response.
- Show immediate feedback using `is_correct`.
- Allow moving to the next question after feedback.
- Disable answer controls while submission is pending.
- Prevent answer submission after finish.

Acceptance criteria:

- Player works for all three supported exercise types.
- Progress bar reflects backend counters and current index.
- Re-answering a question updates counters according to backend response.

### Phase 5: Finish and Result Screen

- Call `POST /quizzes/sessions/{session_id}/finish` when the final question is completed or user chooses finish.
- Fetch `GET /quizzes/sessions/{session_id}` for final source of truth.
- Show:
  - correct answers;
  - answered questions;
  - total questions;
  - percentage;
  - started and finished timestamps.
- Provide actions:
  - retake quiz;
  - return to catalog;
  - open profile attempts.

Acceptance criteria:

- Finished session is not answerable.
- Result screen survives refresh by loading session detail.
- Counters match backend session detail.

### Phase 6: Standalone Exercise Player

- Build public exercise play page.
- Load question through `GET /exercises/{exercise_id}/question`.
- Render the same question components used by quiz player.
- Submit through `POST /exercises/{exercise_id}/perform`.
- Include `type` in request body for standalone perform.
- Show `ok` or `wrong answer` feedback.

Acceptance criteria:

- Standalone player works for grammar, translate, and dictation.
- Standalone perform uses `type`, unlike quiz session answer.
- Dictation media plays from backend `media_url`.

### Phase 7: Student History

- Add profile attempts page from `GET /users/me/quizzes/sessions/my`.
- Add per-quiz attempts view from `GET /users/me/quizzes/{quiz_id}/sessions/my`.
- Show active and finished statuses.
- Allow opening result detail for finished sessions.
- Allow continuing active sessions only if the frontend can reconstruct questions from a new start or session detail. Since `QuizSessionDetail` contains attempts but not full questions, MVP should show active sessions as history entries and start a new attempt from the quiz detail instead of trying to resume.

Acceptance criteria:

- Finished attempts are visible in profile.
- Active sessions are displayed honestly without fake resume behavior.
- Attempt detail permissions are handled through backend `403`.

### Phase 8: Tests

- Add Playwright scenario: browse public quizzes.
- Add Playwright scenario: login, start quiz, answer translate/grammar/dictation questions, finish, see result.
- Add Playwright scenario: standalone exercise correct and wrong answer feedback.
- Add Playwright scenario: unauthenticated quiz start redirects to login.
- Add Playwright scenario: private quiz public detail returns not-found UI.
- Add Playwright scenario: finished session result survives page refresh.

Verification commands:

```bash
pnpm lint
pnpm typecheck
pnpm e2e
```

## Dependencies

- Onboarding/session layer must exist before authenticated quiz sessions.
- Creator flow or backend fixtures must provide public quizzes and exercises for e2e.
- Media files must be available for dictation tests.
- Route handlers must proxy authenticated quiz session endpoints with Bearer token.

## Risks and Decisions

- Backend supports immediate answer evaluation, so MVP should implement training-style feedback only.
- Backend does not currently expose full questions through `QuizSessionDetail`; resuming active sessions after refresh is limited unless player state is cached or backend adds session questions.
- Standalone exercise perform and quiz answer use different payloads. Keep separate functions and schemas.
- Public exercise question does not expose correct answers. Do not add client-side correctness checks.

