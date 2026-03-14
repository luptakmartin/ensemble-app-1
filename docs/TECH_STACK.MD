# TECH-STACK.MD

## Project: Ensemble Logistics Web Application

------------------------------------------------------------------------

# 1. Project Vision

This project is a production-grade, multi-tenant web application for
managing ensemble logistics (events, members, attendance, songs).

The MVP is built using:

-   Next.js (App Router) + TypeScript
-   Supabase (PostgreSQL + Auth + Storage)
-   PWA architecture
-   Czech default language, with full i18n support (CS/SK/EN)

The system must be:

-   Portable to self-hosted PostgreSQL
-   Architecturally clean and layered
-   Secure by default
-   Multi-tenant from day one
-   Ready for SaaS evolution

Supabase is treated as infrastructure, not as core architecture.

------------------------------------------------------------------------

# 2. Core Architectural Principles

## 2.1 Clean Layering

The system must follow strict separation of concerns:

-   UI layer (React components)
-   Application layer (services/use-cases)
-   Data layer (repositories)
-   Infrastructure layer (Supabase adapter implementations)

No direct Supabase calls inside UI components.

All external services must be abstracted behind interfaces.

------------------------------------------------------------------------

## 2.2 Portability Rule

The system must remain portable to:

-   Self-hosted PostgreSQL
-   Railway/Neon/Postgres
-   S3-compatible storage
-   Alternative auth providers (Auth.js, Keycloak, etc.)

Therefore:

-   No business logic in Supabase Edge Functions
-   No core reliance on Supabase-only features
-   All schema defined via migrations inside repository
-   All DB access goes through repository layer

Supabase must be replaceable without rewriting business logic.

------------------------------------------------------------------------

# 3. Technology Stack

## 3.1 Frontend & Backend

-   Next.js (App Router)
-   TypeScript (strict mode enabled)
-   Server Components where appropriate
-   Route Handlers for backend endpoints
-   No client-side business logic duplication

## 3.2 Database

-   PostgreSQL (via Supabase)
-   Migrations stored in repository
-   Drizzle ORM or Prisma (strong typing required)
-   All schema versioned in Git

No schema changes via Supabase UI without migration file.

## 3.3 Auth

-   Supabase Auth (MVP)
-   Wrapped in internal `AuthService` interface
-   Must support migration to alternative auth providers

## 3.4 Storage

-   Supabase Storage (MVP)
-   Wrapped in `StorageService`
-   Paths and keys must remain provider-agnostic

## 3.5 PWA

-   Web App Manifest
-   Service Worker (basic offline support)
-   Installable on Android
-   Offline-lite (cache shell + recent data)

## 3.6 Localization

-   next-intl or equivalent
-   Default locale: `cs`
-   Supported: `cs`, `sk`, `en`
-   URL-based locale routing
-   All UI strings via translation keys
-   No hardcoded UI text in components

------------------------------------------------------------------------

# 4. Project Structure

/app /(public) /(authed) /api

/lib /db /schema /repositories /services /AuthService /StorageService
/supabase /i18n

/types /domain

Rules:

-   UI never imports Supabase directly.
-   Only repositories import DB client.
-   Only service implementations import Supabase SDK.
-   Domain types defined centrally.

------------------------------------------------------------------------

# 5. Multi-Tenancy Rules

## 5.1 Tenancy Model

Single database, shared schema.

Every tenant-scoped table MUST include:

ensemble_id UUID NOT NULL

Core tables:

-   ensembles
-   members
-   events
-   event_attendance
-   compositions
-   attachments

## 5.2 Enforcement

All queries must filter by `ensemble_id`.

RLS policies must be portable PostgreSQL policies.

Never rely solely on frontend filtering for tenant isolation.

------------------------------------------------------------------------

# 6. Security Rules

-   Strict TypeScript mode enabled
-   No implicit `any`
-   Input validation at API boundary
-   No trust in client input
-   Role-based access control enforced server-side
-   No sensitive logic in client components

------------------------------------------------------------------------

# 7. Auth Abstraction

Define:

AuthService - getSession() - signIn() - signOut()

SupabaseAuthService implements it.

All business logic consumes AuthService interface only.

------------------------------------------------------------------------

# 8. Storage Abstraction

Define:

StorageService - upload() - getPublicUrl()

SupabaseStorageService implements it.

No direct storage calls in UI or repositories.

------------------------------------------------------------------------

# 9. Data Modeling Rules

-   Use UUID primary keys
-   Explicit foreign keys
-   Explicit indexes
-   Soft deletes only if required
-   No business logic in triggers unless portable SQL

Attendance statuses must be ENUM-like controlled values.

------------------------------------------------------------------------

# 10. Localization Rules

-   All UI strings via translation keys
-   No hardcoded Czech text in components
-   Domain data stored in Czech (MVP)
-   Future-ready for multilingual domain fields
-   Date/time formatting via Intl API

------------------------------------------------------------------------

# 11. PWA Requirements

-   Installable
-   Full-screen mode
-   Basic offline caching
-   Graceful network error handling
-   No assumption of constant connectivity

Android must be first-class supported platform.

------------------------------------------------------------------------

# 12. Coding Standards

-   Strict TypeScript
-   No hidden side effects
-   Clear domain naming
-   No magic constants
-   Explicit return types for exported functions
-   Clean imports, no circular dependencies
-   Codebase language(functions, variables, etc.) is strictly English

------------------------------------------------------------------------

# 13. Migration Strategy Preparedness

The following must be true at all times:

-   DB schema reproducible from migrations
-   No Supabase-only runtime dependency for core logic
-   Auth provider replaceable
-   Storage provider replaceable
-   Supabase client isolated in one infrastructure layer

Switching to own Postgres should require:

-   Changing DB connection
-   Replacing AuthService implementation
-   Replacing StorageService implementation

No domain rewrite allowed.

------------------------------------------------------------------------

# 14. Future SaaS Evolution Considerations

Architecture must support:

-   Multiple ensembles
-   Per-ensemble admin roles
-   Subscription model (future)
-   Feature flags
-   Usage limits
-   Audit logging (future enhancement)

No architectural decisions that block SaaS evolution.

------------------------------------------------------------------------

# 15. Non-Goals (MVP)

-   No microservices
-   No complex event sourcing
-   No premature scalability optimization
-   No native Android app
-   No heavy offline synchronization engine

Keep MVP clean, layered, and portable.

------------------------------------------------------------------------

# 16. Decision Summary

MVP Stack:

-   Next.js + TypeScript
-   Supabase (Postgres + Auth + Storage)
-   PWA
-   Multi-tenant DB schema (ensemble_id)
-   Czech default language
-   Strict architectural isolation of Supabase

Primary constraint:

Architect today as if Supabase will be replaced tomorrow.
