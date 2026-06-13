# Onboarding Frontend Roadmap

## Goal

Implement registration, login, session bootstrap, and authenticated shell entry for Teglish.

The flow should replace the mock onboarding from `about-teglish/teglish-example.html` with real backend calls:

- `POST /auth/register`
- `POST /auth/token`
- `GET /users/me`

## Product Scope

In scope for MVP:

- Landing/onboarding screen with Teglish identity and clear entry actions.
- Registration by `username`, `password`, optional `name`.
- Login by `username` and `password`.
- Session persistence across refresh.
- Authenticated app shell after successful login.
- Logout on frontend by clearing the stored access token.
- Basic error states for invalid credentials, duplicate username, inactive user, network failure, and expired token.

Out of scope for MVP:

- Password reset.
- Email verification.
- Social login.
- Refresh tokens.
- Role management UI.

## Backend Contract

### Register

`POST /auth/register`

Request body:

```json
{
  "username": "badigadii",
  "password": "password",
  "name": "badigadii"
}
```

Response: `UserRead`

```json
{
  "id": 1,
  "username": "badigadii",
  "name": "badigadii",
  "role": "user",
  "is_active": true
}
```

Important behavior:

- `username`: 3-100 chars.
- `password`: at least 4 chars.
- `name`: optional, max 100 chars.
- Duplicate username returns `409 Conflict`.
- Register does not return an access token, so frontend should either redirect to login or perform login after successful registration. MVP should auto-login after successful registration to keep the flow short.

### Login

`POST /auth/token`

Backend expects `OAuth2PasswordRequestForm`, so the request must be sent as `application/x-www-form-urlencoded`.

Request fields:

```text
username=badigadii
password=password
```

Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

Important behavior:

- Invalid credentials return `401 Incorrect username or password`.
- JWT contains `sub`, `user_id`, and `role`.

### Current User

`GET /users/me`

Headers:

```text
Authorization: Bearer <jwt>
```

Response: `UserRead`.

Important behavior:

- Missing or invalid token returns `401`.
- Inactive user returns `400 Inactive user`.

## Frontend Architecture

Target stack from `package.json` and `README.md`:

- Next.js App Router.
- TypeScript.
- TanStack Query.
- React Hook Form.
- Zod.
- shadcn/ui.
- Playwright.

Use Next route handlers under `/api/*` as the browser-facing layer. Store the backend access token in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie set by route handlers. Do not store JWT in `localStorage`.

Recommended file structure:

```text
src/
  app/
    (auth)/
      page.tsx
    (app)/
      layout.tsx
      page.tsx
    api/
      auth/
        login/route.ts
        logout/route.ts
        me/route.ts
        register/route.ts
  features/
    auth/
      api.ts
      schemas.ts
      types.ts
      use-current-user.ts
      components/
        auth-card.tsx
        login-form.tsx
        register-form.tsx
        session-gate.tsx
  lib/
    api/
      backend-fetch.ts
      errors.ts
    session/
      cookies.ts
```

## UX Direction

Use the example HTML as a style reference, not as exact implementation:

- Warm, friendly Teglish identity.
- Clear first screen with two actions: register and login.
- Compact auth panels, not a marketing-heavy landing page.
- After auth, route into the app shell with top navigation: main, quizzes, create, profile menu.
- Form labels and errors should be explicit and close to fields.

Avoid copying mock-only text that says the form is fake.

## Roadmap

### Phase 1: API and Session Foundation

- Create shared backend fetch helper using `NEXT_PUBLIC_API_BASE_URL`.
- Create typed error normalization for `400`, `401`, `403`, `409`, `422`, and `5xx`.
- Create auth route handlers:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- In `POST /api/auth/login`, proxy credentials to `/auth/token` as form data.
- In `POST /api/auth/register`, call `/auth/register`, then call `/auth/token` with the same credentials and set the session cookie.
- In `GET /api/auth/me`, read the cookie and proxy to `/users/me`.
- In `POST /api/auth/logout`, clear the cookie.

Acceptance criteria:

- Login sets an `HttpOnly` cookie.
- Refreshing the browser keeps the user authenticated.
- Invalid or expired tokens clear the frontend session and return the user to onboarding.

### Phase 2: Validation and Forms

- Add Zod schemas matching backend constraints:
  - `username`: min 3, max 100.
  - `password`: min 4.
  - `name`: optional, max 100.
- Build `LoginForm` with username/password fields.
- Build `RegisterForm` with name/username/password fields.
- Use React Hook Form resolver for validation.
- Disable submit buttons while requests are pending.
- Show backend-specific messages:
  - `409`: username already exists.
  - `401`: username or password is incorrect.
  - `400 Inactive user`: account is inactive.
  - `422`: submitted fields do not match backend validation.

Acceptance criteria:

- Invalid fields are caught before network calls.
- Backend validation errors remain visible after submit.
- User cannot double-submit while a request is pending.

### Phase 3: Onboarding Page

- Build the first screen with Teglish branding and two actions: start learning and login.
- Add register/login panel switching.
- After successful auth, redirect to the app home page.
- Preserve style signals from `teglish-example.html`:
  - friendly brand block;
  - exercise-type hints for translation, grammar, dictation;
  - soft panels and clear primary actions.

Acceptance criteria:

- New user can register and land in the authenticated app.
- Existing user can login and land in the authenticated app.
- User can switch between register and login without losing unrelated UI state.

### Phase 4: Authenticated Shell

- Create `(app)/layout.tsx` with session gate.
- Fetch current user through `GET /api/auth/me`.
- Render top navigation and user menu from real `UserRead`.
- Show `name` in user-facing UI and `username` in account details.
- Hide creator/profile actions until session is loaded.
- Add logout action in the user menu.

Acceptance criteria:

- Unauthenticated users cannot access app routes.
- Authenticated users do not see onboarding again unless they logout or token expires.
- The shell reflects `role` and `is_active` from `/users/me`.

### Phase 5: Tests

- Add Playwright test for registration:
  - open onboarding;
  - fill register form;
  - submit;
  - verify authenticated shell appears with user name.
- Add Playwright test for login:
  - seed or create user through backend;
  - login;
  - verify app shell appears.
- Add Playwright test for duplicate username:
  - register once;
  - try registering again;
  - verify conflict message.
- Add Playwright test for logout:
  - login;
  - logout;
  - verify onboarding is shown.

Verification commands:

```bash
pnpm lint
pnpm typecheck
pnpm e2e
```

## Dependencies

- Backend must be available at `NEXT_PUBLIC_API_BASE_URL`.
- Backend must run migrations before e2e tests.
- Frontend needs a stable cookie name shared by route handlers and middleware/session helpers.

## Risks and Decisions

- Backend does not provide refresh tokens. The frontend should treat token expiry as a normal logout.
- Backend does not provide logout. Frontend logout is cookie deletion only.
- Register does not issue a token. MVP should auto-login after register by calling `/auth/token`.
- JWT should not be exposed to client components.

