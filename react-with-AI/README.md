# TaskFlow — Team Task Tracker

A small React app where projects contain tasks, tasks are assigned to team members and move through statuses, and everyone can find the tasks that matter to them.

**Stack:** Vite · React 19 · TypeScript · React Router · React Hook Form + Zod · Tailwind CSS v4 · json-server 0.17 + json-server-auth (mock REST API) · Vitest + React Testing Library

> ⚠️ json-server and json-server-auth are **mock tools for this POC only**. Never use them in production — there, login and permissions are handled by a real backend.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env      # optional: the default API URL is http://localhost:3001
npm run dev:all           # starts the mock API (port 3001) and the app (port 5173)
```

Open the URL Vite prints (usually http://localhost:5173).

### Test credentials

| Role   | Email                | Password     |
| ------ | -------------------- | ------------ |
| Admin  | admin@taskflow.dev   | `Admin@123`  |
| Member | mohan@taskflow.dev   | `Member@123` |
| Member | priya@taskflow.dev   | `Member@123` |

### Scripts

| Script             | What it does |
| ------------------ | ------------ |
| `npm run dev:all`  | Mock API + app together |
| `npm run api`      | Mock API only (creates `mock-api/db.json` on first run) |
| `npm run api:seed` | Reset the mock data (stop the API first) |
| `npm run dev`      | App only |
| `npm test`         | Run the tests once (`npm run test:watch` to watch) |
| `npm run lint`     | ESLint |
| `npm run build`    | Type-check and production build |

## The mock API

- `mock-api/seed.mjs` generates `mock-api/db.json` with 3 users (bcrypt-hashed passwords), 4 projects and 18 tasks. Due dates are relative to today, so there are always overdue tasks. Project "Q4 Planning" has no tasks (to show the empty state). `db.json` is git-ignored because json-server rewrites it on every change.
- `POST /login` checks the password against the hash and returns `{ accessToken, user }` (a JWT valid for 1 hour). The app never compares passwords itself.
- `mock-api/routes.json` guards every resource: requests without a valid token get **401**. Try opening http://localhost:3001/tasks in the browser.
- **Admin-only rules are enforced only in the UI.** json-server-auth has no idea what a role is, so a member with a token could still call `DELETE /projects/1` with curl. In a real app, the backend checks the user's role on every request.

## Folder structure

```
mock-api/            seed script + route guards for json-server-auth
src/
  types/             domain types (User, Project, Task) and status/priority lists
  schemas/           Zod schemas for every form (form types are inferred from them)
  services/          the only code that talks to the API (apiClient + one file per resource)
  context/           AuthContext + AuthProvider (logged-in user)
  hooks/             useAuth, useFetch (loading / error / data + retry + cancel)
  lib/               pure helpers: dates, task filters, shared styles
  components/        reusable UI: forms, table, badges, loading/error/empty states
  pages/             one component per screen
  routes/            route tree, ProtectedRoute, AdminRoute, AppLayout
  test/              test setup and helpers
```

Rules: components never call `fetch` (they call services); the logged-in user is shared via Context; every form uses React Hook Form with a Zod schema.

## Where state lives

Every piece of state has exactly one home. If a value were stored in two places, one would eventually be wrong.

| State | Home | Why |
| ----- | ---- | --- |
| Projects, tasks, users | **The API** (server state), loaded by each screen with `useFetch` | The server is the source of truth. Each screen refetches when it mounts, so after editing a task and going back, the list shows the new data. |
| Task list filters & search | **The URL** (`?status=done&assignee=2&q=login`), read with `useSearchParams` | Refresh and shared links show the same view. The filtered list is *derived* from tasks + URL on each render, never stored. |
| Logged-in user + token | **AuthContext**, persisted to `localStorage` | Many screens need it (nav, guards, My tasks). Context avoids prop drilling; storage keeps you logged in after refresh. The password is never stored — it exists only for the duration of the login request. |
| Form input | **React Hook Form** | It owns input values, validation errors and `isSubmitting`. |
| Modal open, "saving…" flags | **Local `useState`** in the component that uses it | Nobody else needs to know. |
| Derived values (task count, overdue, groups in My tasks) | **Computed during render** | Storing them would duplicate data that can go stale. |

## Auth flow

1. The login form validates with Zod; invalid input never reaches the API.
2. `authService.login` calls `POST /login`. Wrong email *or* password → one generic message: "Invalid email or password."
3. On success, `AuthProvider` saves `{ token, user }` (no password) to `localStorage` and to state.
4. `apiClient` attaches `Authorization: Bearer <token>` to every request.
5. On refresh, `AuthProvider` restores the session; an already-expired token is dropped with a "session expired" message.
6. If any request returns **401**, `apiClient` calls the handler `AuthProvider` registered: the session is cleared, `ProtectedRoute` redirects to `/login` with a clear message, and after logging in again you return to the page you were on.
7. Log out clears the session.

## Tests

`npm test` covers:

- **Login**: invalid input shows field errors without calling the API; wrong password shows the generic message; a successful login never stores the password.
- **Task form validation**: required title, length limits, no past due date on create (allowed on edit), input kept on a failed save.
- **Protected routes**: logged-out users are redirected to login and back to the original URL; members typing an admin URL are blocked.
- **Task list**: loading, empty, error (with working Retry), URL filters, overdue marking, not-found project.

## Manual checks

- Stop the mock API and use the app: every screen shows an error with a Retry button.
- `/tasks/9999` → "Task not found"; `/anything` → 404 page.
- Log in as a member and open `/projects/new` → "Admins only".
- Filter a project's task list, refresh → the filters stay.
- In DevTools → Application → Local Storage, edit the token to garbage and click around → back to login with "Your session has expired".
