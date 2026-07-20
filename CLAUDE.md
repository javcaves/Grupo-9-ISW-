# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

CleanAdmin is a management platform for operations coordination, built around three domains: RRHH (shifts/attendance, QR/token-based check-in), Bodega (inventory with stock-movement tracking and negative-stock blocking), and Actividades/Calificaciones (task scheduling constrained by employee qualifications). Roles form a strict hierarchy: `ROOT > ADMIN > SUPERVISOR > ENCARGADO > EMPLEADO`.

This is a monorepo with two independent Node projects and no shared root `package.json`:
- `backend/` — Express 5 + TypeORM + PostgreSQL API
- `cleanadmin-app/` — React 19 + Vite + Tailwind v4 SPA

## Commands

Run these from inside each subproject directory (`backend/` or `cleanadmin-app/`), not the repo root.

### backend
- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — start once with node
- `npm run seed` — run `src/seed/seed.js` (full reset/reseed of data)
- No test runner is configured (`npm test` is a stub that exits with an error).

### cleanadmin-app
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint over the whole project
- `npm run preview` — preview a production build

There is no automated test suite in either subproject currently.

## Backend architecture

**Entry chain:** `src/index.js` → connects to Postgres (`connectDB`), ensures a ROOT user exists (`ensureRootUser`), starts the task scheduler (`iniciarSchedulerTareas`), then `app.listen`. `src/app.js` wires global middleware (CORS restricted to `localhost:5173`/`3000`, morgan, `express.json`, cookie-parser, passport JWT) and mounts everything under `/api` from `src/routes/index.routes.js`.

**Request pipeline is a strict funnel, not per-route middleware:** in `routes/index.routes.js`, only `/api/auth/*` and `POST /api/notificaciones/solicitud-password` are public. Every other route is registered *after* a single global `router.use(authenticateJwt)` call — so authentication is enforced centrally, not per-module. Role authorization, however, *is* per-route: each module's `*.routes.js` applies `checkRole([...roles])` (from `middlewares/role.middleware.js`) individually per endpoint, typically defined as named role arrays at the top of the file (e.g. `rolesGestion`, `rolesLectura`).

**Auth:** JWT is issued in `middlewares/auth.controller.js#login`, stored in an httpOnly `jwt` cookie (not a bearer header), and validated via `passport-jwt` (configured in `config/passport.config.js`). `req.user` is populated with `{ id_usuario, rol }` from the token payload — role checks read `req.user.rol` directly, no DB lookup per request.

**Module layout:** each domain lives under `src/modules/<name>/` with a consistent 4-file split:
- `*.routes.js` — Express router; wires `authenticateJwt` + `checkRole` per endpoint and points at controller functions
- `*.controller.js` — thin HTTP layer: Joi-validates input, calls the service, maps results to `handleSuccess`/`handleErrorClient`/`handleErrorServer` (`handlers/responseHandlers.js`)
- `*.service.js` — business logic; talks to TypeORM directly via `AppDataSource.getRepository("EntityName")` (string name, not the imported class)
- `*.validation.js` / `*.validations.js` — Joi schemas (naming is inconsistent between modules — check the actual filename before importing)

Services return `[result, errorMessage]` tuples (Go-style) rather than throwing on business-rule failures — controllers check `if (err) return handleErrorClient(...)` after every service call. Exceptions/throws are reserved for unexpected errors, caught by the controller's outer `try/catch` and turned into `handleErrorServer`.

**Entities:** `src/entity/*.entity.js` are TypeORM `EntitySchema` definitions (not decorator classes). `config/ConfigDB.js` auto-discovers every `*.entity.js` file in `src/entity/` at startup and registers it on `AppDataSource` — a new entity file is picked up automatically, no manual registration needed except `usuario.entity.js`, which is force-imported first as a safety net. `synchronize: true` is enabled, so schema changes to entities apply directly to the DB on next boot (no migrations).

**Scheduler:** `src/scheduler/tareaScheduler.js` polls every 60s and flips `ProgramarTarea` rows from `ASIGNADA` to `EN_PROCESO` once their scheduled date/time has passed. It runs in-process (`setInterval`), started once from `index.js`.

**Dead code to be aware of:** `src/shared/dbHandler.js` (raw `pg` pool) and `src/shared/jsonDbHandler.js` (JSON-file storage) are not imported anywhere — all real persistence goes through TypeORM/`AppDataSource`. Don't extend them; if new persistence is needed, follow the `AppDataSource.getRepository(...)` pattern used everywhere else.

**Config:** `src/config/ConfigEnv.js` loads `src/config/.env` (co-located with the config files, not the backend root) via dotenv and exports `PORT`, `HOST`, `DATABASE`, `DB_USERNAME`, `PASSWORD`, `JWT_SECRET`.

## Frontend architecture

**Auth/session flow:** `AuthContext` (`src/context/AuthContext.jsx`) checks session on mount via `AuthService.me()` (cookie-based — no token is stored client-side) and exposes `user`, `isAuthenticated`, `loginUser`, `logoutUser`. `App.jsx` gates all non-`/login` routes behind a `PrivateRoute` that reads `isAuthenticated`.

**Role-based routing:** After auth, `App.jsx` hands off to `RoleRouter` (`src/routes/RoleRouter.jsx`), which branches its *entire* route tree on `user.rol`: `EMPLEADO` gets `EmployeeLayout` + employee-only pages (`pages/employee/*`); every other role gets `MainLayout` + admin pages (`pages/admin/*`). There's no shared route table with per-route guards — the split happens once, at the top.

**API layer:** one thin wrapper per backend module in `src/api/*.service.js`, all built on `src/api/api.js`'s `request()` helper. It always sends `credentials: "include"` (required for the httpOnly cookie) and throws an `Error` with the backend's `message` (+ `errorDetails`/`details`/`error` when present) on non-OK responses — callers should catch and surface `error.message` rather than re-parsing the response. `BASE_URL` is hardcoded to `http://localhost:3000/api` in `api.js` (no env-based override).

**Styling:** Tailwind v4 via `@tailwindcss/vite` (no separate `tailwind.config.js` — config lives in `vite.config.js` and CSS). Light/dark theme CSS lives in `src/styles/light.css` / `dark.css`, toggled through `context/ThemeContext.jsx`.

**Component conventions:** one-off dialogs live in `src/components/modals/`, QR-related UI/logic in `src/components/qr/`, notification UI in `src/components/notificaciones/`. Page components under `src/pages/admin/proyectos/` are project-scoped views (turnos, tareas, inventario, asistencia, actividades) nested under a given `proyecto`.
