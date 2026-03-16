# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is DocPres

A prescription management web app for doctors. Doctors sign up, manage patients and medicines, create prescriptions (general or eye-specific), and print them. Built with Next.js 16 (App Router), Prisma, PostgreSQL, NextAuth v5, and Tailwind CSS v4.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run db:migrate` — run Prisma migrations (`prisma migrate dev`)
- `npm run db:generate` — regenerate Prisma client
- `npm run db:seed` — seed database
- `npm run db:studio` — open Prisma Studio
- `npm run setup` — initial DB setup (migrate + seed)
- `docker compose up` — run app + Postgres via Docker

## Architecture

- **Next.js App Router** with route groups: `(auth)` for login/forgot-password, `(dashboard)` for the main app, `(print)` for prescription print views
- **Server Actions** in `src/lib/actions/` handle all mutations (patients, medicines, prescriptions, doctor settings, advice templates). No REST API beyond NextAuth and file upload routes.
- **Auth**: NextAuth v5 with credentials provider. Session carries doctor `id` as `user.id`. Config split between `src/lib/auth.ts` and `src/lib/auth.config.ts`.
- **Database**: PostgreSQL via Prisma. Schema in `prisma/schema.prisma`. All data is scoped per-doctor (multi-tenant by doctorId foreign key).
- **Prescription types**: `GENERAL` and `EYE` — eye prescriptions use `templateData` JSON field for structured eye exam data. Templates in `src/lib/prescription-templates/`.
- **UI**: Radix UI primitives + shadcn-style components in `src/components/ui/`. Page-level client components are co-located as `*-client.tsx` files next to their `page.tsx`.
- **Print**: Dedicated `(print)` layout with `src/components/print/print-controls.tsx` for browser print.
- **File uploads**: `src/app/api/upload/route.ts` handles logo/signature/stamp uploads to `public/uploads/`.
