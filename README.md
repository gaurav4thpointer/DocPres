# DocPres — Digital Prescription Manager

A production-ready web application for a single doctor to create and manage digital prescriptions. Built with Next.js 14+, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

---

## Features

- **Secure Authentication** — Doctor login with email + password, JWT sessions
- **Dashboard** — Stats overview, recent patients, recent prescriptions, quick actions
- **Patient Management** — Add, edit, view, search patients with full medical history
- **Medicine Master** — Doctor-specific medicine list with favorites and autocomplete
- **Prescription Creation** — Fast prescription editor with medicine autocomplete, dynamic rows, draft/finalize flow
- **Prescription History** — Search, filter by status, view, duplicate, print
- **Print Layout** — Clinic-ready A4 print view with header, Rx section, footer, signature/stamp
- **Settings** — Doctor profile, clinic settings, logo/signature/stamp upload, advice templates

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma v7 |
| Auth | NextAuth v5 (beta) |
| Forms | React Hook Form + Zod v4 |
| Icons | Lucide React |
| File Uploads | Local filesystem (S3-ready abstraction) |

---

## Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+ running locally
- **npm** or **pnpm**

---

## Setup Instructions

### 1. Navigate to the app directory

```bash
cd docpres-app
```

### 2. Install dependencies (already done if you ran npm install)

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/docpres?schema=public"

# Generate a secure random secret (minimum 32 characters)
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"

# App URL
NEXTAUTH_URL="http://localhost:3000"

# File upload directory (relative to project root)
UPLOAD_DIR="./public/uploads"
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Create the PostgreSQL database

```bash
createdb docpres
# or using psql:
psql -U postgres -c "CREATE DATABASE docpres;"
```

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed the database

```bash
npx prisma db seed
```

This creates:
- **Doctor account**: `dr.sharma@clinic.com` / `doctor123`
- **5 sample patients** with realistic data
- **12 medicines** in the master list
- **3 prescriptions** (2 finalized, 1 draft)
- **4 advice templates**

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Login Credentials (Seed Data)

```
Email:    dr.sharma@clinic.com
Password: doctor123
```

---

## App Navigation

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview with stats and recent activity |
| `/prescriptions/new` | Create a new prescription |
| `/patients` | Patient list with search and pagination |
| `/patients/[id]` | Patient profile with prescription history |
| `/medicines` | Medicine master list |
| `/prescriptions` | Prescription history |
| `/prescriptions/[id]` | View/edit a prescription |
| `/settings` | Doctor profile, clinic settings, advice templates |
| `/print/prescription/[id]` | Print-ready prescription view |

---

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

---

## Project Structure

```
docpres-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data seeder
├── prisma.config.ts           # Prisma v7 configuration
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, forgot-password pages
│   │   ├── (dashboard)/       # Protected app routes
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── patients/      # Patient management
│   │   │   ├── medicines/     # Medicine master
│   │   │   ├── prescriptions/ # Prescriptions (list, new, detail)
│   │   │   └── settings/      # Profile and clinic settings
│   │   ├── (print)/           # Print layout (no sidebar)
│   │   │   └── print/prescription/[id]/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth handler
│   │   │   └── upload/        # File upload API
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Root redirect
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Reusable UI: Button, Input, Card, Modal, etc.
│   │   ├── layout/            # Sidebar, PageHeader
│   │   ├── patients/          # PatientForm
│   │   └── prescriptions/     # PrescriptionEditor, MedicineRow
│   ├── lib/
│   │   ├── actions/           # Server actions
│   │   │   ├── advice.ts      # Advice templates CRUD
│   │   │   ├── doctor.ts      # Doctor/clinic settings
│   │   │   ├── medicines.ts   # Medicine CRUD
│   │   │   ├── patients.ts    # Patient CRUD
│   │   │   └── prescriptions.ts # Prescription CRUD + stats
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── upload.ts          # File upload abstraction
│   │   └── utils.ts           # Helpers, constants, date utils
│   ├── middleware.ts           # Auth protection middleware
│   └── types/
│       └── next-auth.d.ts     # Session type extensions
└── public/
    └── uploads/               # Uploaded files (logo, signature, stamp)
```

---

## Data Model

```
Doctor
  ├── ClinicSettings (1:1)
  ├── Patient[] (1:many)
  ├── Medicine[] (1:many)
  ├── Prescription[] (1:many)
  └── AdviceTemplate[] (1:many)

Patient
  └── Prescription[] (1:many)

Prescription
  └── PrescriptionItem[] (1:many)
       └── Medicine? (many:1, optional)
```

**Prescription Statuses:**
- `DRAFT` — Editable, not locked
- `FINALIZED` — Locked for integrity, printable only

---

## File Uploads

Files (logo, signature, stamp) are stored locally under `./public/uploads/`.

**To migrate to AWS S3**, update `src/lib/upload.ts`:
- Replace `uploadFile()` with `S3Client.putObject()`
- Replace `deleteFile()` with `S3Client.deleteObject()`
- Return public S3 URLs instead of local paths
- No other code changes required

---

## Business Rules

1. Only one doctor login in V1 (multi-doctor support ready to add)
2. Finalized prescriptions are **locked** — cannot be edited
3. Use "Duplicate" to create a new prescription from an old one
4. Internal notes are **never** shown on the print layout
5. Medicine master provides autocomplete; free-text entry is also supported

---

## Production Deployment

1. Set all `.env` variables with production values
2. Generate a strong `NEXTAUTH_SECRET`
3. Run `npx prisma migrate deploy` (not `dev`)
4. Run `npm run build && npm start`
5. Configure a reverse proxy (nginx/Caddy) with HTTPS
6. Ensure `UPLOAD_DIR` is a persistent volume path

---

## Adding Multi-Doctor Support (Future V2)

The codebase is structured for easy multi-doctor expansion:
- All DB queries already filter by `doctorId`
- Add a `/signup` page to create additional doctor accounts
- Add an admin role to manage accounts if needed
- No schema changes required

---

## License

Private use. Not for distribution.
