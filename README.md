# TaskFlow — Office Task Management System

A professional Kanban-style task management app built with React, Vite, Tailwind CSS,
and Supabase.

## Features

- **Authentication** — sign up / sign in with Supabase Auth, protected routes, session persistence
- **Kanban board** — drag-and-drop tasks across four columns (`todo`, `in_progress`, `review`, `done`) using `@hello-pangea/dnd`; status changes persist to Supabase
- **Task management** — create, edit, and delete tasks with title, description, priority, assignee, and due date
- **Team directory** — view all workspace members with their roles
- **Roles** — `admin` / `employee` profiles, managed with Row Level Security
- **Professional UI** — dark sidebar + top navbar, modern Tailwind styling, Lucide icons

## Tech Stack

| Layer     | Tool                                            |
| --------- | ----------------------------------------------- |
| Frontend  | React 19, Vite 8, Tailwind CSS 4                |
| UI icons  | lucide-react                                    |
| Drag & drop | @hello-pangea/dnd                            |
| Routing   | react-router-dom v7                             |
| Backend   | Supabase (PostgreSQL + Auth + RLS)              |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then fill in your Supabase project values (Supabase Dashboard → **Project Settings → API**):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> Both values are safe to expose in the browser — the anon key is JWT-gated by RLS.

### 3. Set up the database

Run the migration in `supabase/migrations/202608110001_initial_schema.sql` against your
project. The easiest way is the **SQL Editor** in the Supabase dashboard: paste the whole
file and run it.

The migration creates:

- `profiles` — mirrors `auth.users` via a trigger; holds `full_name`, `email`, and `role`
- `tasks` — Kanban tasks with `status`, `priority`, `assigned_to`, `due_date`, etc.
- Row Level Security policies for both tables
- `updated_at` auto-tracking on tasks

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:5173 — register an account (or two: one `admin`, one `employee`)
and start dragging tasks around.

## Project Structure

```
src/
├── main.jsx                  # Entry point (Router + AuthProvider)
├── App.jsx                   # Route definitions
├── index.css                 # Tailwind import + base styles
├── services/
│   └── supabaseClient.js     # Supabase client (reads env vars)
├── context/
│   └── AuthContext.jsx       # Session state, sign in/up/out, profile
├── lib/
│   ├── constants.js          # Status/priority/role metadata (single source of truth)
│   └── utils.js              # Date, initials, avatar helpers
├── components/
│   ├── Avatar.jsx
│   ├── ProtectedRoute.jsx    # Auth guard
│   ├── PublicOnlyRoute.jsx   # Redirects authed users away from auth pages
│   ├── layout/
│   │   ├── AppLayout.jsx     # Sidebar + Navbar + content shell
│   │   ├── Sidebar.jsx
│   │   └── Navbar.jsx
│   └── board/
│       ├── KanbanBoard.jsx   # Drag-drop context + task fetching
│       ├── BoardColumn.jsx   # Droppable column
│       ├── TaskCard.jsx      # Draggable card
│       └── TaskModal.jsx     # Create/edit/delete dialog
└── pages/
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── BoardPage.jsx
    └── TeamPage.jsx
```

## Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev`      | Start the dev server         |
| `npm run build`    | Production build             |
| `npm run preview`  | Preview the production build |
| `npm run lint`     | Run oxlint                   |

## How the Kanban drag-and-drop works

`KanbanBoard` wraps the four `BoardColumn` components in a `DragDropContext`. Each column
is a `Droppable`; each `TaskCard` is a `Draggable`. On drop, the card is optimistically
moved to the destination column in local state, and if the status changed, an
`UPDATE tasks SET status = ...` is sent to Supabase. On failure, the board re-fetches to
roll back.

## Database Schema

```sql
profiles(id uuid PK → auth.users, full_name text, email text, role text check('admin'|'employee'))
tasks(id uuid PK, title text, description text,
      status text check('todo'|'in_progress'|'review'|'done'),
      priority text check('low'|'medium'|'high'),
      assigned_to uuid → profiles, due_date date, created_by uuid → profiles)
```
