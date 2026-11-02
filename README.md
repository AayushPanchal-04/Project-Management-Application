# Project Management Application

A full-stack project management app where teams organize work into **workspaces**, **projects**, and **tasks**. Authentication and workspaces are powered by **Clerk** (a workspace maps 1:1 to a Clerk Organization), the API is an **Express + Prisma** server backed by **PostgreSQL (Neon)**, and the UI is a **React + Vite + Tailwind** SPA.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Set up the server](#2-set-up-the-server)
  - [3. Set up the client](#3-set-up-the-client)
  - [4. Run both apps](#4-run-both-apps)
- [Environment Variables](#environment-variables)
- [How Workspaces Work](#how-workspaces-work)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Authentication** with Clerk (email/password, Google, etc.)
- **Workspaces** — each workspace is a Clerk Organization, so members and roles are managed by Clerk
- **Role-based permissions** — `ADMIN` vs `MEMBER` per workspace
- **Projects** — create, edit, delete, with status, priority, progress, and start/end dates
- **Tasks** — create, update, delete, assign to members, with status/type/priority and due dates
- **Comments** on tasks
- **Team management** — invite members, add project members
- **Dashboard** — stats, charts (recharts), recent activity, task summaries
- **Calendar** view for project tasks
- **Dark / light theme** toggle (persisted to localStorage)
- **Email notifications** — task assignment + due-date reminders via Inngest + SMTP
- **Cascade deletes** — deleting a workspace/project removes its projects/tasks/comments
- **Auto-sync** — Clerk users and organizations are synced into the database

---

## Tech Stack

**Client**

| Package | Purpose |
| --- | --- |
| React 19 + Vite 7 | SPA framework / build tool |
| Tailwind CSS 4 | Styling |
| Redux Toolkit | Global state (`workspace`, `theme` slices) |
| React Router 7 | Routing |
| `@clerk/clerk-react` | Authentication + organizations |
| axios | HTTP client |
| lucide-react | Icons |
| recharts | Dashboard charts |
| react-hot-toast | Toasts |
| date-fns | Date formatting |

**Server**

| Package | Purpose |
| --- | --- |
| Express 5 | HTTP API |
| Prisma 6 | ORM (`@prisma/adapter-neon` driver adapter) |
| `@neondatabase/serverless` | Neon PostgreSQL driver |
| `@clerk/express` | Auth middleware (`clerkMiddleware`, `req.auth()`) |
| Inngest | Background jobs / Clerk webhook handlers |
| Nodemailer | Sending task emails |
| CORS, dotenv, nodemon | Standard tooling |

---

## Project Structure

```
project-management/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── app/store.js        # Redux store
│   │   ├── components/         # Reusable UI (ProjectCard, Sidebar, WorkspaceDropdown, ...)
│   │   ├── configs/api.js      # axios instance (baseURL = VITE_BASEURL)
│   │   ├── features/           # Redux slices: workspaceSlice.js, themeSlice.js
│   │   ├── pages/              # Layout, Dashboard, Projects, ProjectDetails, TaskDetails, Team, Settings
│   │   ├── App.jsx             # Routes
│   │   └── main.jsx            # Entry point (ClerkProvider + Redux Provider)
│   └── .env                    # Client environment variables
│
└── server/                     # Express API
    ├── configs/                # prisma.js, nodemailer.js
    ├── controllers/            # workspaceController, projectController, taskController, commentController
    ├── middlewares/            # authMiddleware.js (protect)
    ├── routes/                 # workspaceRoutes, projectRoutes, taskRoutes, commentRoutes
    ├── inngest/index.js        # Clerk sync functions + task email jobs
    ├── prisma/schema.prisma    # Database schema
    ├── server.js               # Entry point
    └── .env                    # Server environment variables
```

---

## Prerequisites

- **Node.js 18+** (Node 20+ recommended) and npm
- A **PostgreSQL** database — a free [Neon](https://neon.tech) project works out of the box
- A **Clerk** account and application — [clerk.com](https://clerk.com)
- (Optional) An **Inngest** account for webhook sync and email jobs
- (Optional) An SMTP provider (e.g. [Brevo](https://brevo.com)) to actually send emails

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AayushPanchal-04/Project-Management-Application.git
cd Project-Management-Application
```

> **Note:** `.env` files are intentionally **not** committed (they contain secrets). You must create them yourself in the next steps.

### 2. Set up the server

```bash
cd server
npm install
```

Create `server/.env` (see [Environment Variables](#environment-variables) for the full list):

```env
NODE_ENV="development"

CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

DATABASE_URL="postgresql://user:password@host-pooler.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@host.aws.neon.tech/neondb?sslmode=require"

INNGEST_EVENT_KEY="xxxxxxxxxxxxxxxxxxxx"
INNGEST_SIGNING_KEY="signkey-prod-xxxxxxxxxxxxxxxxxxxx"

SENDER_EMAIL="you@example.com"
SMTP_USER="your_smtp_login"
SMTP_PASS="your_smtp_password"
```

Push the schema to your database (creates all tables):

```bash
npx prisma db push
```

Generate the Prisma client and start the API:

```bash
npm run server
```

You should see `Server running on port 5000`. Check it with `http://localhost:5000/` → `Server is live!`

### 3. Set up the client

In a **second terminal**:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxx"
VITE_BASEURL=http://localhost:5000
```

> `VITE_CLERK_PUBLISHABLE_KEY` must be the **same** Clerk application as `CLERK_PUBLISHABLE_KEY` on the server.
>
> `VITE_BASEURL` must point at your running API server, with **no trailing slash**.

### 4. Run both apps

```bash
# Terminal 1
cd server && npm run server     # http://localhost:5000

# Terminal 2
cd client && npm run dev        # http://localhost:5173
```

Open **http://localhost:5173**, sign in, and create a workspace.

---

## Environment Variables

### `server/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | `development` or `production`. Defaults to development. |
| `PORT` | No | API port. Defaults to `5000`. |
| `CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk publishable key (`pk_test_...` / `pk_live_...`). |
| `CLERK_SECRET_KEY` | **Yes** | Clerk secret key (`sk_test_...`). Used by `clerkMiddleware` and for syncing users/organizations. **Never expose this.** |
| `CLERK_WEBHOOK_SECRET` | Yes* | Signing secret (`whsec_...`) used by Clerk webhooks. *Needed for webhook-driven sync; the app also self-syncs on `GET /api/workspaces`, so local development works without it.* |
| `DATABASE_URL` | **Yes** | Pooled PostgreSQL connection string. |
| `DIRECT_URL` | **Yes** | Direct (non-pooled) connection string. Used by Prisma for migrations. |
| `INNGEST_EVENT_KEY` | No | Inngest event key for sending events. |
| `INNGEST_SIGNING_KEY` | No | Inngest signing key for the `/api/inngest` endpoint. |
| `SENDER_EMAIL` | No | From-address for notification emails. |
| `SMTP_USER` | No | SMTP login. |
| `SMTP_PASS` | No | SMTP password. |

### `client/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk publishable key. Must match the server's Clerk app. |
| `VITE_BASEURL` | **Yes** | Base URL of the API, e.g. `http://localhost:5000` (no trailing slash). |

> Vite only exposes variables prefixed with `VITE_`. After editing `client/.env`, restart the dev server.

---

## How Workspaces Work

This is the most important concept to understand:

1. A **workspace** in this app **is** a Clerk **Organization**. Its `id` in the database is the Clerk organization id (e.g. `org_3LX...`).
2. Members and roles live in Clerk. `workspace.ownerId` maps to the Clerk `created_by` user id.
3. On every `GET /api/workspaces`, the server **syncs** the signed-in user and all of their Clerk organizations into PostgreSQL:
   - Creates/updates the `User` row if missing
   - Upserts each `Workspace` and `WorkspaceMember` (mapping `org:admin` → `ADMIN`, everything else → `MEMBER`)
   - Removes any workspace the user belongs to that no longer exists in Clerk
4. This differs from a pure webhook setup — **Clerk webhooks cannot reach `localhost`**, so the app also syncs on request. That is why the app works locally without a tunnel.
5. Deleting a workspace deletes the Clerk organization **first**, then the database row (so a failed Clerk delete can't silently resurrect the workspace).

`Inngest` functions in `server/inngest/index.js` provide the same sync for the webhook events (`clerk/user.created`, `clerk/organization.created`, `clerk/organization.deleted`, etc.) when webhooks are reachable, plus the task-assignment and due-date reminder emails.

**Permissions:** destructive and administrative actions require the user to be an `ADMIN` of the workspace.

---

## API Reference

All routes except `/` and `/api/inngest` require authentication. Send the Clerk session token as a Bearer token:

```
Authorization: Bearer <clerk-session-token>
```

The client obtains it via `getToken()` from `@clerk/clerk-react`.

### Workspaces — `/api/workspaces`

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Get all workspaces for the signed-in user (with members, projects, tasks, comments). Also triggers the Clerk → DB sync. |
| `DELETE` | `/:id` | Delete a workspace. Deletes the Clerk organization first, then the DB row. Requires `ADMIN`. |

### Projects — `/api/projects`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Create a project. Requires `ADMIN`. |
| `PUT` | `/` | Update a project. Requires `ADMIN`. |
| `DELETE` | `/:projectId` | Delete a project and its tasks/members/comments. Requires `ADMIN` or the project lead. |
| `POST` | `/:projectId/addMember` | Add a member to a project. |

### Tasks — `/api/tasks`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Create a task. |
| `PUT` | `/:id` | Update a task (status, type, priority, assignee, etc.). |
| `POST` | `/delete` | Delete a task. |

### Comments — `/api/comments`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Add a comment to a task. |
| `GET` | `/:taskId` | Get all comments for a task. |

### Other

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check — returns `Server is live!` |
| `*` | `/api/inngest` | Inngest handler (webhook sync + email jobs). |

---

## Database Schema

Defined in `server/prisma/schema.prisma`. Core models:

- **User** — mirrors a Clerk user (`id` = Clerk user id). Has workspaces, owned projects, assigned tasks, comments.
- **Workspace** — mirrors a Clerk organization (`id` = Clerk org id). Unique `slug`, owner, members, projects.
- **WorkspaceMember** — join table with a `WorkspaceRole` (`ADMIN` / `MEMBER`). Unique per `(userId, workspaceId)`.
- **Project** — belongs to a workspace, has a `team_lead` (owner), `ProjectStatus`, `Priority`, `progress`, dates, members, tasks.
- **ProjectMember** — join table. Unique per `(userId, projectId)`.
- **Task** — belongs to a project, has an assignee, `TaskStatus`, `TaskType`, `Priority`, `due_date`, comments.
- **Comment** — belongs to a task and a user.

Enums: `WorkspaceRole`, `TaskStatus` (`TODO` / `IN_PROGRESS` / `DONE`), `TaskType` (`TASK` / `BUG` / `FEATURE` / `IMPROVEMENT` / `OTHER`), `ProjectStatus` (`ACTIVE` / `PLANNING` / `COMPLETED` / `ON_HOLD` / `CANCELLED`), `Priority` (`LOW` / `MEDIUM` / `HIGH`).

All child relations use `onDelete: Cascade`, so deleting a workspace removes its projects → tasks → comments.

---

## Available Scripts

### Server (`server/`)

| Command | Description |
| --- | --- |
| `npm run server` | Start the API with nodemon (auto-restart on changes) |
| `npm start` | Generate the Prisma client, then start with plain node |
| `npx prisma db push` | Sync the Prisma schema to the database |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma studio` | Open a GUI to browse the database |

### Client (`client/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (http://localhost:5173) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Troubleshooting

**Stuck on the Clerk "Create organization" screen**
Your Clerk user has no organization yet, so there is no workspace to load. Create one — the app will sync it and load. (Earlier versions auto-created a workspace; that was removed because it generated duplicate organizations.)

**Only some / not all workspaces are visible**
Workspaces come from Clerk organizations. The server paginates the Clerk membership list, so all of them sync. If a workspace is missing, confirm you're still a member of that organization in Clerk, then reload the app.

**A deleted project or workspace keeps coming back after reload**
Make sure the server is running the latest code — the sync deletes workspaces that no longer exist in Clerk, and workspace deletion removes the Clerk organization first. If a Clerk delete fails, the API returns an error instead of silently deleting locally.

**`Unauthorized` on API calls**
The request had no valid Clerk session token. Check that `CLERK_PUBLISHABLE_KEY` (server) and `VITE_CLERK_PUBLISHABLE_KEY` (client) belong to the **same** Clerk application, then sign out and back in.

**`npm install` hangs on the server / Prisma prompt**
The `postinstall` script runs `npx prisma generate`. Install the Prisma CLI first if it prompts:

```bash
npm install prisma@^6.15.0 --save-dev
npm install
```

**Emails never arrive**
`SENDER_EMAIL`, `SMTP_USER`, and `SMTP_PASS` ship as placeholders. Set real SMTP credentials for assignment and reminder emails to be delivered. Task emails also require Inngest (`INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY`).

**Changes to `.env` have no effect**
Both Vite and Node read env vars at startup. Restart the dev server after editing `.env`.

**Prisma client errors after changing the schema**
Re-run `npx prisma generate` (and `npx prisma db push` if the schema changed).

---

## License

ISC
