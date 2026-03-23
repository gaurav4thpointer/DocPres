# RxPad — Digital Prescription Manager

A web application for clinics and doctors to manage patients, medicines, and digital prescriptions with print-ready output. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, PostgreSQL, Prisma 7, and NextAuth v5.

---

## Features

- **Roles** — Platform **admin**, **clinic** accounts, and **doctor** accounts (credentials + JWT sessions)
- **Multi-tenant** — Data is scoped by **clinic** and **doctor** (`clinicId` / `doctorId` on core models)
- **Clinic management** — Clinic users see a **Doctors** section to manage doctors in their organization
- **Admin console** — `/admin` for platform operators; optional **impersonation** handoff to act as a clinic (`/impersonate?token=…`)
- **Dashboard** — Stats, recent patients, recent prescriptions, quick actions
- **Patient management** — CRUD, search, medical history, prescription history per patient
- **Medicine master** — Per-doctor catalog with favorites and autocomplete on prescriptions
- **Prescriptions** — **General** and **Eye** types; eye charts use structured `templateData` (JSON) and templates under `src/lib/prescription-templates/`
- **Workflow** — Draft / finalize; duplicate; print; internal notes excluded from print
- **Settings** — Doctor profile, clinic branding (logo, signature, stamp), advice templates
- **Marketing site** — Public landing at `/` (logged-in users redirect to `/dashboard`)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Radix UI primitives, Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma 7 (`prisma.config.ts` + `@prisma/adapter-pg`) |
| Auth | NextAuth v5 (credentials, JWT sessions) |
| Forms | React Hook Form + Zod 4 |
| Icons | Lucide React |
| File uploads | Local filesystem under `public/uploads/` (`src/lib/upload.ts`, S3-ready shape) |

---

## Prerequisites

- **Node.js** 18+ (project dev deps target Node 20 types)
- **PostgreSQL** 14+ (Docker Compose uses Postgres 16)
- **npm**

---

## Setup

### 1. Install dependencies

```bash
cd docpres-app
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (see Docker Compose for a minimal production-style example):

```env
# PostgreSQL (Prisma reads this via prisma.config.ts)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/docpres?schema=public"

# NextAuth — use a long random secret (32+ characters)
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
# Optional: NextAuth v5 also accepts AUTH_SECRET (used for impersonation JWT signing)
# AUTH_SECRET="same-or-different-strong-secret"

NEXTAUTH_URL="http://localhost:3000"

# Upload directory (relative to project root)
UPLOAD_DIR="./public/uploads"
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Database

```bash
createdb docpres
# or: psql -U postgres -c "CREATE DATABASE docpres;"
```

### 4. Migrate and seed

Either step by step:

```bash
npm run db:migrate
npm run db:seed
```

Or initial setup in one shot:

```bash
npm run setup
```

Seed creates:

- **Admin**: `admin@rxpad.com` / `admin123`
- **Clinic**: `clinic@sharmamedical.com` / `clinic123`
- **Doctor**: `dr.sharma@clinic.com` / `doctor123`
- **6** sample patients, **12** medicines, **5** prescriptions (including **Eye** and draft examples), **4** advice templates

### 5. Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `/login` for clinic and doctor accounts.

---

## Main routes

| Route | Description |
|-------|-------------|
| `/` | Public landing (redirects to `/dashboard` if signed in) |
| `/login` | Clinic and doctor sign-in |
| `/forgot-password` | Password recovery UI |
| `/dashboard` | Overview |
| `/prescriptions/new` | New prescription |
| `/prescriptions` | Prescription history |
| `/prescriptions/[id]` | View / edit prescription |
| `/patients` | Patients list |
| `/patients/[id]` | Patient detail |
| `/medicines` | Medicine master |
| `/doctors` | Doctors (visible to **clinic** role) |
| `/settings` | Profile and clinic print assets |
| `/print/prescription/[id]` | Print layout |
| `/admin` | Admin console |
| `/impersonate` | Consumes short-lived token to sign in as clinic (admin flow) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Prisma Studio |
| `npm run setup` | Migrate (`init`) + seed |

---

## Docker

From the repo root:

```bash
docker compose up --build
```

Services: **Postgres** (`docpres` / `docpres`) and the **app** container with `DATABASE_URL` pointing at `db`. Set `NEXTAUTH_SECRET` (and optionally `NEXTAUTH_URL`) in your environment when deploying.

---

## Project structure

```
docpres-app/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── prisma.config.ts           # Prisma 7 config (datasource URL, seed command)
├── docker-compose.yml
├── Dockerfile
├── src/
│   ├── app/
│   │   ├── (auth)/            # login, forgot-password
│   │   ├── (dashboard)/       # dashboard, patients, medicines, prescriptions, doctors, settings
│   │   ├── (print)/           # print layout + /print/prescription/[id]
│   │   ├── admin/             # platform admin UI
│   │   ├── api/auth/          # NextAuth route handler
│   │   ├── api/upload/        # logo / signature / stamp uploads
│   │   ├── impersonate/       # clinic impersonation handoff
│   │   ├── layout.tsx
│   │   ├── page.tsx           # public landing
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Buttons, inputs, dialogs, etc.
│   │   ├── layout/            # Sidebar, page header
│   │   ├── patients/
│   │   ├── prescriptions/     # Editor, medicine rows, eye section
│   │   └── print/
│   ├── lib/
│   │   ├── actions/           # Server actions: patients, medicines, prescriptions, doctor, advice, admin
│   │   ├── prescription-templates/  # general + eye defaults
│   │   ├── auth.ts            # NextAuth + credentials + impersonation helpers
│   │   ├── auth.config.ts     # JWT/session callbacks, route authorization
│   │   ├── prisma.ts
│   │   ├── upload.ts
│   │   └── utils.ts
│   ├── proxy.ts               # Next.js proxy: exports `auth` for protected routes
│   └── types/
│       └── next-auth.d.ts
└── public/uploads/
```

Mutations are implemented as **Server Actions** under `src/lib/actions/` (no separate REST API for app data beyond NextAuth and uploads).

---

## Data model (summary)

- **Admin** — platform users (separate from clinics)
- **Clinic** — organization; owns shared scope for patients/medicines/prescriptions at the DB level with `doctorId` on rows for doctor ownership
- **Doctor** — belongs to one clinic; `@@unique([clinicId, email])` (same email may exist in another clinic)
- **ClinicSettings** — one row per doctor (print header, logo, signature, stamp)
- **Patient**, **Medicine**, **Prescription**, **AdviceTemplate** — tied to `clinicId` and `doctorId`
- **Prescription** → **PrescriptionItem** (optional link to **Medicine**)

**Prescription status:** `DRAFT` (editable) · `FINALIZED` (locked, printable)

**Prescription type:** `GENERAL` · `EYE` (structured fields in `templateData`)

---

## File uploads

Files are stored under `./public/uploads/` by default. To move to S3, adapt `src/lib/upload.ts` (`uploadFile` / `deleteFile` and returned URLs) without changing callers.

---

## Business rules

1. Finalized prescriptions cannot be edited; use **Duplicate** to create a new draft from an existing one.
2. **Internal notes** are not shown on the print layout.
3. Medicine master powers autocomplete; line items still allow free-text medicine names.
4. Clinic users manage doctors; doctors use the main app sidebar without the Doctors item unless logged in as a clinic.

---

## Production deployment

1. Set `DATABASE_URL`, `NEXTAUTH_SECRET` (and `NEXTAUTH_URL` / `AUTH_TRUST_HOST` as required by your host).
2. Run `npx prisma migrate deploy` (not `migrate dev`).
3. Run `npm run build && npm start` (or use the provided Dockerfile).
4. Terminate TLS at your reverse proxy (nginx, Caddy, load balancer).
5. Mount or point `UPLOAD_DIR` to persistent storage.

---

## License

Private use. Not for distribution.
