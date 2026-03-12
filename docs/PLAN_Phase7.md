# Phase 7: Polish + PWA

## Context
Phases 0–6 are complete. The app has full CRUD for events/compositions/members, attendance tracking, calendar view, and i18n. Phase 7 adds polish: toast notifications for mutations, skeleton loading states, error boundary, and PWA support (service worker + icons).

## Steps

### 1. Install shadcn sonner + skeleton
```bash
npx shadcn@latest add sonner
npx shadcn@latest add skeleton
```
Creates `src/components/ui/sonner.tsx` and `src/components/ui/skeleton.tsx`.

### 2. Add Toaster to locale layout
**Modify:** `src/app/[locale]/layout.tsx`
- Import `Toaster` from `@/components/ui/sonner`
- Add `<Toaster position="bottom-center" />` after `NextIntlClientProvider` inside `<body>`
- Use `offset` or `className` to position above mobile bottom nav (56px)

### 3. Add i18n toast/error keys
**Modify:** `src/lib/i18n/messages/{en,cs,sk}.json`
- Add `"toast"` section: `saveSuccess`, `deleteSuccess`, `error`, `networkError`, `attendanceUpdated`, `inviteSent`, `passwordChanged`, `profileUpdated`, `attachmentAdded`, `attachmentDeleted`, `compositionLinked`, `compositionUnlinked`
- Add `"error"` section: `title` ("Something went wrong"), `tryAgain` ("Try again")

### 4. Refactor mutations to use toast
**Modify 14 components** — replace `useState` serverError/success with `toast.success()`/`toast.error()`:

| Component | Mutation | Toast |
|-----------|----------|-------|
| `events/event-card.tsx` | DELETE | success + error |
| `events/event-detail.tsx` | DELETE | success + error |
| `events/event-form.tsx` | POST/PUT | success + error, remove `serverError` state |
| `events/calendar-event-popover.tsx` | PUT attendance | error only (optimistic UI) |
| `compositions/composition-card.tsx` | DELETE | success + error |
| `compositions/composition-form.tsx` | POST/PUT | success + error |
| `compositions/attachment-list.tsx` | DELETE | success + error |
| `compositions/attachment-upload.tsx` | POST | success + error |
| `compositions/event-composition-picker.tsx` | POST/DELETE | success + error |
| `attendance/attendance-panel.tsx` | PUT | error only (optimistic UI) |
| `profile/profile-form.tsx` | PUT | success + error, remove `success` state |
| `profile/change-password-form.tsx` | PUT | success + error |
| `members/invite-member-dialog.tsx` | POST | success + error |
| `members/role-manager.tsx` | PUT | success + error |

Pattern: wrap fetch in try/catch, `toast.error()` on network catch, `toast.error(data.error)` on !ok, `toast.success()` on success. Keep react-hook-form field validation as-is.

### 5. Create skeleton-card component
**Create:** `src/components/ui/skeleton-card.tsx`
- Reuse `Card`/`CardHeader`/`CardContent` + `Skeleton` primitive
- Mimic event-card layout (title + badge + 3 detail lines)

### 6. Create loading.tsx files
**Create:**
- `src/app/[locale]/(authed)/events/loading.tsx` — title skeleton + 6 SkeletonCards in grid
- `src/app/[locale]/(authed)/compositions/loading.tsx` — title skeleton + 4 SkeletonCards
- `src/app/[locale]/(authed)/members/loading.tsx` — title skeleton + 6 SkeletonCards

### 7. Create error boundary
**Create:** `src/app/[locale]/(authed)/error.tsx`
- Client component with `error` + `reset` props
- Shows error message + "Try again" button using `error.title` / `error.tryAgain` i18n keys

### 8. Create service worker
**Create:** `public/sw.js`
- Minimal hand-written SW (no next-pwa)
- Cache-first for `/_next/static/` and `/icons/`
- Network-first for navigation with offline fallback
- Clean old caches on activate

### 9. Register service worker
**Create:** `src/components/pwa/sw-register.tsx`
- Client component, `useEffect` → `navigator.serviceWorker.register("/sw.js")`, silent catch

**Modify:** `src/app/[locale]/layout.tsx` — add `<ServiceWorkerRegister />`

### 10. PWA icons
- Generate simple PNG icons (192x192, 512x512) with "E" on #1e293b background
- Save to `public/icons/` — manifest already references these paths

### 11. Tests
- `src/components/ui/__tests__/skeleton-card.test.tsx` — renders skeleton elements
- Mock `sonner` in existing tests where toast calls are added

## Key Files
- `src/app/[locale]/layout.tsx` — add Toaster + SW register
- `src/lib/i18n/messages/{en,cs,sk}.json` — toast/error keys
- `src/components/ui/skeleton-card.tsx` — create
- `src/app/[locale]/(authed)/{events,compositions,members}/loading.tsx` — create
- `src/app/[locale]/(authed)/error.tsx` — create
- `public/sw.js` — create
- `src/components/pwa/sw-register.tsx` — create
- 14 mutation components — modify for toast

## Verification
1. `npm run build` — no TypeScript errors
2. `npm run lint` — no lint issues
3. `npm test` — all tests pass
4. Manual: navigate pages → see skeleton loading
5. Manual: create/edit/delete → see toast notifications
6. Manual: DevTools → Application → Service Workers → verify registration
7. Manual: DevTools → Manifest → verify PWA installable
