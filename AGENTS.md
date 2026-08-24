# AGENTS.md

Instructions for AI coding agents working in this repository.

## Fork Policy — Read Before Any Git Operation

> This is a **personal fork** (`jjjermiah/pelagica`) of `PelagicaApp/pelagica`, maintained solely for personal use.
>
> - **NEVER** open a pull request against `upstream` (`PelagicaApp/pelagica`), under any circumstance, for any change, no matter how small or how clearly it looks like a general-purpose bugfix.
> - **NEVER** push branches, tags, or commits to the `upstream` remote. `upstream` is fetch-only, for pulling updates — never push to it.
> - All work (branches, commits, releases, tags) stays on `origin` (`jjjermiah/pelagica`) only.
> - If a change seems upstream-worthy, STOP and ask the human — do not act on that judgment autonomously.

Before any `git push`, run `git remote -v` and confirm the target is `origin`.

## Repo Structure

This is a pnpm workspace (`pnpm-workspace.yaml`: `frontend`, `tizen`, `packages/*`) plus a standalone Go module (`backend/`), orchestrated with [Task](https://taskfile.dev) (`Taskfile.yml` at root, includes per-package `Taskfile.yml`s).

- **`frontend/`** — React 19 + Vite + TypeScript web client. This is the main Pelagica UI (browser and, via a build mode, desktop webview). Talks to a Jellyfin server directly from the browser using `@jellyfin/sdk`, and to the Go `backend/` for a small set of app-specific endpoints (config, themes, studio logos, stats consent, Seerr proxy).
- **`backend/`** — Go + Fiber v3 API server (`pelagica-backend` module). Serves `/api/*`: per-server JSON config (`GetConfig`/config.go), theme CRUD, studio logo lookup/health (`studios_db.go`-backed sqlite cache), anonymous usage stats collection (`collector/`), and a Jellyseerr proxy (`seerr.go`) so the frontend never talks to Seerr directly. Does **not** proxy Jellyfin API calls.
- **`desktop/`** — [Wails v3](https://v3.wails.io) wrapper that packages `frontend/dist` (built via `pnpm run build:desktop`) into native macOS/Windows/Linux apps. Separate Go module from `backend/`. Only relevant when building the desktop app — the Docker/web build (see `Dockerfile`) never touches this directory.
- **`tizen/`** — Samsung Tizen TV app package (own `package.json`, own `Taskfile.yml`, `oxlint` for linting instead of ESLint).
- **`packages/core/`** — `@pelagica/core`, a shared TypeScript package (workspace dependency, consumed via `workspace:*`) holding config types/schema, hooks (`useConfig`, `useRecommendedItems`, etc.), i18n, and the Jellyfin-plugin API client (`api/pelagicaPlugin.ts`). Consumed by `frontend` and presumably the TV packages.
- **`packages/tv-frontend/`** and **`packages/tv-platform/`** — additional workspace packages for the TV app line (own `Taskfile.yml`s wired into root `Taskfile.yml` under `tv-frontend`).
- **`.github/workflows/`** — CI (see below).
- Root also has `Dockerfile`, `docker-compose.yml` / `docker-compose.local.yml`, `nginx.conf` — the production web deployment builds frontend + backend into a single `nginx:alpine` image (frontend static files served by nginx, backend binary run alongside via `CMD ["/bin/sh", "-c", "exec /server & exec nginx -g 'daemon off;'"]`).

## Commands

All commands below are real, taken from `package.json` / `Taskfile.yml` files in this repo — nothing invented.

### Root (`Taskfile.yml`, run via `task <name>` from repo root)

- `task dev` — run backend + frontend dev servers in parallel (deps: `backend`, `frontend`).
- `task checkup` — full check suite: frontend `lint` + `format:check`, plus `tv-frontend:format:check`, `tv-frontend:lint`, `tizen:format:check`, `tizen:lint`.
- `task version VERSION=1.2.3` — bumps the version string across `frontend/package.json`, `tizen/package.json`, `tizen/public/config.xml`, `backend/Taskfile.yml` (`APP_VERSION` env), and `desktop/build/config.yml`.
- `task docker` — `docker compose -f docker-compose.local.yml up --build` (local Docker build/run).
- `task docker:stop` — tear down the local Docker compose stack.
- `task stats` — `cloc .` line-count report, excluding `dist`/`node_modules`/lockfiles.

### Backend (`backend/Taskfile.yml`, included as flattened tasks — run from root or `backend/`)

- `task backend` (root) / `task` (inside `backend/`) — `go run main.go`, with dev env vars set (config path, `ENABLE_AUTH=true`, `LOG_LEVEL=debug`, etc. — see `backend/Taskfile.yml` for the full env block).
- `install-backend` is internal (`go mod download`), triggered automatically as a dependency.
- **No `go test`, `go vet`, or linter task exists in this repo** (no `*_test.go` files, no golangci-lint config found). Verify Go changes with `go build ./...` from `backend/` (or `desktop/`, which is a separate Go module) before considering the work done.

### Frontend (`frontend/package.json` scripts, and `frontend/Taskfile.yml` wrappers)

- `pnpm dev` (`vite`) — dev server.
- `pnpm build` (`tsc -b && vite build`) — production build.
- `pnpm build:demo` — `vite build --mode demo`.
- `pnpm build:desktop` — `vite build --mode desktop` (used by `desktop:assets` task to produce the bundle Wails packages).
- `pnpm lint` / `pnpm lint:fix` — `eslint .` / `eslint . --fix`.
- `pnpm format` / `pnpm format:check` — `prettier --write .` / `prettier --check .`.
- `pnpm preview` — `vite preview`.
- Task equivalents exist at the root: `task lint`, `task lint:fix`, `task format`, `task format:check`, `task build-frontend`, `task build-frontend-desktop` (all flattened from `frontend/Taskfile.yml`).

### Desktop (`desktop/Taskfile.yml`, run from `desktop/`)

- `task` (default) — `go run .` (runs the Wails app; depends on `assets`, which builds and copies `frontend/dist` in).
- `task build` — `go build -o bin/pelagica .`.
- `task generate-bindings` — regenerates Wails TS bindings into `frontend/src/bindings` from Go services (`wails3 generate bindings`).
- `task package:macos` / `task installer:macos` — unsigned/ad-hoc `.app` and `.dmg` (macOS-only, requires `create-dmg`).
- `task package:windows` / `task installer:windows` — unsigned `.exe` and NSIS installer (Windows-only, requires `makensis`).
- `task package:linux` / `task installer:linux` (`:deb`, `:appimage`) — Linux binary/deb/AppImage (Linux-only, requires gcc/gtk4/webkitgtk-6.0 dev headers).

### Tizen (`tizen/Taskfile.yml`, `oxlint`-based — see `.oxlintrc.json`)

- `task tizen:lint`, `task tizen:format:check` are pulled into `task checkup`. See `tizen/Taskfile.yml` / `tizen/package.json` for the underlying scripts.

## Key Architectural Facts

- **Jellyfin access is browser-direct, not backend-proxied.** The frontend imports `@jellyfin/sdk` in ~80+ files under `frontend/src/` and talks to the user's configured Jellyfin server straight from the browser (server URL persisted via `frontend/src/utils/localstorageCredentials.ts` / `getServerUrl()`). The Go `backend/` never sits in that request path. Do not assume Jellyfin data flows through the Go API.
- **The Go backend is a small support service**, not a general API gateway. Its actual routes (see `backend/main.go`): `/api/config`, `/api/server-address`, `/api/branding/logo/:mode`, `/api/themes*`, `/api/studios*`, `/api/stats-consent`, and `/api/seerr/*` (a proxy so the browser never calls Jellyseerr directly with its API key). Auth is a simple middleware (`ENABLE_AUTH` env var) gating write endpoints (`handlers/auth.go`).
- **App/homescreen config has two possible sources**, and the frontend currently only wires up one of them: `packages/core/src/hooks/useConfig.ts`'s `fetchConfig()` calls `fetchPluginConfig()` (`packages/core/src/api/pelagicaPlugin.ts`), which hits a **Jellyfin server plugin** (`PelagicaApp/jellyfin-plugin`, GUID `3b9ad352-24fd-4792-a41d-b7673744bb03`) at `<jellyfin-server>/Pelagica/Config` — not the Go backend's own `/api/config` endpoint (which reads/writes `config.json` per server key under a data dir, `backend/handlers/config.go`). If the plugin isn't installed/enabled on the user's Jellyfin server, config silently falls back to `DEFAULT_CONFIG` in `useConfig.ts`. Know which path you're editing before changing config behavior.
- **The config schema lives in `packages/core/src/hooks/useConfig.ts`** (`AppConfig`, `HomeScreenSection` union — `mediaBar`, `recentlyAdded`, `items`, `continueWatching`, `recommendedItems`, `nextUp`, `resume`, `genres`, `libraries`, `studios`, `seerrDiscover` — plus `ItemPageSettings`). `frontend/public/example.config.json` is a worked example of that schema (it even references `./config.schema.json` via `$schema`) and doubles as informal documentation — keep it in sync when the `AppConfig`/section types change.
- **Wails (`desktop/`) is desktop-only and irrelevant to the Docker/web build.** `Dockerfile` builds only `frontend` (via `pnpm --filter pelagica run build`) and `backend`, copied into an `nginx:alpine` final stage — `desktop/` is never referenced. Conversely, the desktop app depends on `frontend/dist` (built with `pnpm run build:desktop`) and generates its own Wails Go bindings into `frontend/src/bindings` — don't hand-edit files under `frontend/src/bindings`; regenerate via `task generate-bindings` in `desktop/`.
- **`backend/` and `desktop/` are separate Go modules** (`pelagica-backend` vs. the module in `desktop/go.mod`) — dependencies, versions, and builds are independent; there's no shared Go code between them.
- **Frontend and Tizen use different linters**: `frontend/` uses ESLint (flat config, `typescript-eslint`) + Prettier; `tizen/` uses `oxlint` (`.oxlintrc.json`) + Prettier. Don't assume ESLint config applies to `tizen/`.
- **`packages/core` is workspace-linked** (`"@pelagica/core": "workspace:*"` in `frontend/package.json`), not published to npm — edits there take effect immediately in `frontend` via pnpm's workspace symlinking, no publish/version-bump step needed for local dev.

## CI (`.github/workflows/`)

Only three workflows exist in this fork; several upstream-specific ones were intentionally removed (see below).

- **`lint.yml`** — "Lint & Format". Runs on PRs and on push to `main` (path-filtered to JS/TS/JSON/lockfile/eslint/prettier config changes). Working directory `frontend/`; installs with pnpm (frozen lockfile), then `pnpm lint` and `pnpm format:check`.
- **`validate-pr-target.yml`** — "Validate PR Target". On PR open/reopen/sync/edit, fails if the PR targets `main` but its head branch isn't `develop` (i.e. only `develop → main` PRs are allowed to target `main`).
- **`docker-release.yml`** — "Build and Publish Multi-Arch Docker Image". Triggers on GitHub Release `published`. Builds `linux/amd64` and `linux/arm64` images via Buildx (matrix job, one runner per platform), pushes digests to **`ghcr.io/jjjermiah/pelagica`** (via `ghcr.io/${{ github.repository }}`, GITHUB_TOKEN auth), tagged `<ref>-<platform>` and `latest-<platform>`; a second `merge` job combines the per-arch digests into multi-arch manifests tagged `<ref>` and `latest` using `docker buildx imagetools create`. This was changed from upstream's Docker Hub target to publish to this fork's own GHCR namespace.
- **Removed (present upstream, deleted in this fork)**: `desktop-release.yml`, `tizen-release.yml`, `deploy-demo.yml` — these targeted upstream-specific code-signing secrets and demo infrastructure (`demo.pelagica.app`) that this personal fork does not have and does not need.

## Notes

- Frontend package manager is **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) — do not introduce npm/yarn lockfiles.
- Root `package.json` is just a private workspace root marker (`pelagica-monorepo`, no scripts) — real scripts live in the sub-package `package.json`s and `Taskfile.yml`s.
