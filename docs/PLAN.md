# Ensemble App - Implementation Plan

## Context

The Ensemble App manages choir/music ensemble events and tracks member attendance. The scaffold is complete: Next.js 16 App Router, Drizzle ORM with full schema (no migrations yet), Supabase clients, next-intl (cs/sk/en), domain types, service interfaces (auth/storage — no implementations), and placeholder pages. This plan covers the full MVP implementation broken into 8 phases, starting with data model and core infrastructure.

## Library Additions

| Library | Purpose |
|---------|---------|
| shadcn/ui + Radix UI | Accessible UI components (copied into repo) |
| zod | Input validation at API boundary |
| react-hook-form + @hookform/resolvers | Form state management |
| date-fns | Date formatting/manipulation |
| @fullcalendar/react + daygrid + interaction | Calendar view |

---

## Phase 0: Foundation (Database + UI Toolkit + Core Infrastructure)

### 0.1 Schema Refinements (before first migration)
Add missing unique constraints:
- `src/lib/db/schema/members.ts` — unique on `(ensemble_id, user_id)` in `members`, unique on `(member_id, role)` in `memberRoles`
- `src/lib/db/schema/events.ts` — unique on `(event_id, member_id)` in `eventAttendance`
- `src/lib/db/schema/compositions.ts` — unique on `(event_id, composition_id)` in `eventCompositions`

### 0.2 Generate & Run Drizzle Migrations
```
npx drizzle-kit generate
npx drizzle-kit migrate
```
Creates: `src/lib/db/migrations/0000_*.sql`

### 0.3 RLS Policies
Create: `src/lib/db/rls/policies.sql` — portable Postgres RLS policies per table (ensembles, members, member_roles, events, event_attendance, compositions, event_compositions, attachments). All scoped by `ensemble_id` and role.

### 0.4 Install shadcn/ui + Dependencies
```
npx shadcn@latest init
npm install zod react-hook-form @hookform/resolvers date-fns
```
Creates: `components.json`, `src/lib/utils.ts`, initial UI primitives under `src/components/ui/`

### 0.5 Repository Layer
- `src/lib/db/repositories/base-repository.ts` — abstract base with `ensembleId` + `db` instance
- `src/lib/db/repositories/ensemble-repository.ts`
- `src/lib/db/repositories/member-repository.ts` — CRUD + role management
- `src/lib/db/repositories/event-repository.ts` — stub
- `src/lib/db/repositories/index.ts`

All queries must filter by `ensembleId`.

### 0.6 Auth Service Implementation
- `src/lib/services/auth/supabase-auth-service.ts` — implements existing `AuthService` interface
- `src/lib/services/auth/index.ts` — factory `getAuthService()`

### 0.7 Session Context Helper
- `src/lib/auth/session.ts` — `getSessionContext()` returns `{ session, member, ensembleId }`. Used by all API routes and server components.

### 0.8 Zod Validation Schemas
- `src/lib/validation/schemas.ts` — schemas for login, event, attendance, composition, attachment, member profile, member invite

---

## Phase 1: Authentication

### Files to modify
- `src/app/[locale]/(public)/login/page.tsx` — real login form (shadcn Input/Button/Card + react-hook-form + zod)
- `src/app/[locale]/(authed)/layout.tsx` — async server component calling `getSessionContext()`, redirect if unauthenticated, render nav shell
- `src/middleware.ts` — add auth redirect for `/(authed)` routes

### Files to create
- `src/app/[locale]/(public)/login/actions.ts` — server action `signIn()`
- `src/app/[locale]/(public)/reset-password/page.tsx` — password recovery form
- `src/app/[locale]/(authed)/actions.ts` — server action `signOut()`
- `src/components/layout/sidebar.tsx` — desktop sidebar nav
- `src/components/layout/mobile-nav.tsx` — bottom tab bar for mobile
- `src/components/layout/nav-items.ts` — nav config with role-based visibility

---

## Phase 2: Events CRUD (Card View)

### Files to create
- `src/lib/db/repositories/event-repository.ts` — complete: `findUpcoming()`, `findPast()`, `findById()`, `create()`, `update()`, `delete()`
- `src/app/api/events/route.ts` — GET (list), POST (create, director/admin)
- `src/app/api/events/[id]/route.ts` — GET, PUT, DELETE (role-checked)
- `src/components/events/event-card.tsx` — type badge, date, time, place
- `src/components/events/event-list.tsx` — upcoming/past tabs
- `src/components/events/event-form.tsx` — create/edit form
- `src/components/events/event-type-badge.tsx` — color-coded per type
- `src/app/[locale]/(authed)/events/new/page.tsx`
- `src/app/[locale]/(authed)/events/[id]/page.tsx` — event detail
- `src/app/[locale]/(authed)/events/[id]/edit/page.tsx`

### Files to modify
- `src/app/[locale]/(authed)/events/page.tsx` — server component rendering EventList

---

## Phase 3: Attendance/Presence

### Files to create
- `src/lib/db/repositories/attendance-repository.ts` — `findByEvent()`, `upsert()`, `bulkCreateForEvent()`
- `src/app/api/events/[id]/attendance/route.ts` — GET, PUT (enforces: members before event only, admins/directors anytime)
- `src/components/attendance/presence-button.tsx` — 4-state toggle (Yes=green, Maybe=blue, No=red, Unset=grey)
- `src/components/attendance/attendance-summary.tsx` — status count bars
- `src/components/attendance/attendance-detail.tsx` — per-member table grouped by voice group
- `src/components/attendance/attendance-panel.tsx` — wraps summary + detail + own presence button

### Files to modify
- `src/app/[locale]/(authed)/events/[id]/page.tsx` — add AttendancePanel

Auto-create "unset" attendance for all members when an event is created.

---

## Phase 4: Compositions + Attachments

### Files to create
- `src/lib/db/repositories/composition-repository.ts` — CRUD + `findByEvent()`, `linkToEvent()`, `unlinkFromEvent()`
- `src/lib/db/repositories/attachment-repository.ts`
- `src/lib/services/storage/supabase-storage-service.ts` — implements `StorageService`
- `src/lib/services/storage/index.ts` — factory
- `src/app/api/compositions/route.ts` — GET, POST
- `src/app/api/compositions/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/compositions/[id]/attachments/route.ts` — GET, POST
- `src/app/api/compositions/[id]/attachments/[attachmentId]/route.ts` — DELETE
- `src/app/api/events/[id]/compositions/route.ts` — GET, POST (link), DELETE (unlink)
- `src/components/compositions/composition-card.tsx`
- `src/components/compositions/composition-list.tsx`
- `src/components/compositions/composition-form.tsx`
- `src/components/compositions/attachment-list.tsx` — clickable sheet/audio links
- `src/components/compositions/attachment-upload.tsx` — file upload or link input
- `src/components/compositions/event-composition-picker.tsx` — dialog to link compositions to events
- `src/app/[locale]/(authed)/compositions/new/page.tsx`
- `src/app/[locale]/(authed)/compositions/[id]/page.tsx`
- `src/app/[locale]/(authed)/compositions/[id]/edit/page.tsx`

### Files to modify
- `src/app/[locale]/(authed)/compositions/page.tsx`
- `src/app/[locale]/(authed)/events/[id]/page.tsx` — add compositions section

---

## Phase 5: Member Management + Profiles

### Files to create
- `src/app/api/members/route.ts` — GET, POST (invite, admin only)
- `src/app/api/members/[id]/route.ts` — GET, PUT, DELETE
- `src/app/api/members/[id]/roles/route.ts` — PUT (admin only)
- `src/app/api/profile/route.ts` — GET, PUT
- `src/app/api/profile/password/route.ts` — PUT
- `src/app/api/profile/picture/route.ts` — PUT (via StorageService)
- `src/components/members/member-list.tsx` — table with voice group filter
- `src/components/members/member-card.tsx`
- `src/components/members/invite-member-dialog.tsx`
- `src/components/members/role-manager.tsx`
- `src/components/members/voice-group-select.tsx`
- `src/components/profile/profile-form.tsx`
- `src/components/profile/change-password-form.tsx`
- `src/app/[locale]/(authed)/members/[id]/page.tsx`

### Files to modify
- `src/lib/services/auth/auth-service.ts` — add `inviteUser()` to interface
- `src/lib/services/auth/supabase-auth-service.ts` — implement using Supabase Admin API
- `src/app/[locale]/(authed)/members/page.tsx`
- `src/app/[locale]/(authed)/profile/page.tsx`

---

## Phase 6: Calendar View

### Install
```
npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
```

### Files to create
- `src/components/events/event-calendar.tsx` — FullCalendar month view, events color-coded by type
- `src/components/events/calendar-event-popover.tsx` — click popover with event summary + quick presence toggle

### Files to modify
- `src/app/[locale]/(authed)/events/page.tsx` — tab toggle between Card View and Calendar View

Configure FullCalendar locale to match current next-intl locale.

---

## Phase 7: Polish + PWA

### Files to create
- `public/sw.js` — service worker: cache app shell + recent data for offline-lite
- `src/app/[locale]/(authed)/events/loading.tsx` — skeleton loaders
- `src/app/[locale]/(authed)/compositions/loading.tsx`
- `src/app/[locale]/(authed)/members/loading.tsx`
- `src/app/[locale]/(authed)/error.tsx` — error boundary
- `src/components/ui/skeleton-card.tsx`

### Additional polish
- Toast notifications (shadcn Sonner) for all mutations
- Responsive refinement: bottom tab bar on mobile, stackable cards, scrollable calendar
- Graceful network error handling

---

## Key Architectural Decisions

1. **API Routes for mutations, Server Components for reads.** Pages call repositories directly via server components. API routes exist for client-side mutations.
2. **Single ensemble per user (MVP).** `getSessionContext()` resolves `ensembleId` from the `members` table. Multi-ensemble support is architecturally ready.
3. **No client state management library.** Local React state + react-hook-form suffice. Add zustand later if needed.
4. **Translation keys already exist** in cs/en/sk.json for all sections. Add keys incrementally for new UI text.

## Verification

After each phase:
1. `npm run build` — verify no TypeScript errors
2. `npm run lint` — verify no lint issues
3. `npm run dev` — manual testing of new features
4. Test role-based access by logging in as admin/director/member
5. Verify multi-tenant isolation: all queries include `ensemble_id`
6. Check responsive layout at mobile/tablet/desktop widths
