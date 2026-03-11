# Phase 4: Compositions + Attachments

## Context

Phases 1-3 (Auth, Events CRUD, Attendance) are complete with 65 passing tests. Phase 4 adds composition management — directors/admins can create musical compositions with sheet/audio attachments (files or links), and link compositions to events. Members can view compositions linked to events.

**DB schema already exists**: `compositions`, `eventCompositions` (N:M join), `attachments` tables in `src/lib/db/schema/compositions.ts`.
**Validation schemas already exist**: `compositionSchema` and `attachmentSchema` in `src/lib/validation/schemas.ts`.
**i18n keys partially exist**: basic keys (title, name, author, duration, sheets, audio) in all 3 locales.
**StorageService interface exists**: `src/lib/services/storage/storage-service.ts` — no implementation yet.

## Permission Rules

| Actor | View compositions | CRUD compositions | Link to events | Upload attachments |
|-------|------------------|-------------------|----------------|-------------------|
| Member | Event-linked only | DENY (403) | DENY (403) | DENY (403) |
| Director | All | ALLOW | ALLOW | ALLOW |
| Admin | All | ALLOW | ALLOW | ALLOW |

## Implementation Steps

### 1. Install shadcn components

```bash
npx shadcn@latest add dialog checkbox
```

### 2. Composition Repository — `src/lib/db/repositories/composition-repository.ts`

Extends `BaseRepository`. Types:
```typescript
type Composition = typeof compositions.$inferSelect;
type CreateCompositionData = { name: string; author: string; duration?: string };
type UpdateCompositionData = Partial<CreateCompositionData>;
```

Methods:
- `findAll()` — all compositions for ensemble, ordered by name
- `findById(id)` — single composition scoped by ensembleId
- `findByEvent(eventId)` — JOIN `eventCompositions` + `compositions`, filter by eventId + ensembleId
- `findLinkedToAnyEvent()` — compositions with at least one `eventCompositions` entry (for member view)
- `create(data)` — insert with ensembleId, returning
- `update(id, data)` — update with updatedAt, scoped by ensembleId
- `delete(id)` — delete scoped by ensembleId
- `linkToEvent(compositionId, eventId)` — insert into `eventCompositions`, onConflictDoNothing
- `unlinkFromEvent(compositionId, eventId)` — delete from `eventCompositions`

### 3. Attachment Repository — `src/lib/db/repositories/attachment-repository.ts`

Standalone class (no BaseRepository — attachments belong to compositions, not directly to ensembles). Callers verify ensemble ownership via CompositionRepository first.

Methods:
- `findByComposition(compositionId)` — ordered by type then name
- `findById(id)` — single lookup
- `create(data: { compositionId, type, name, url, isLink })` — insert, returning
- `delete(id)` — delete, returning deleted row (for storage cleanup)

### 4. Update repository index — `src/lib/db/repositories/index.ts`

Re-export `CompositionRepository`, `Composition`, `CreateCompositionData`, `UpdateCompositionData`, `AttachmentRepository`, `Attachment`.

### 5. Supabase Storage Service — `src/lib/services/storage/supabase-storage-service.ts`

Implements `StorageService`. Takes supabase client in constructor.

```typescript
class SupabaseStorageService implements StorageService {
  constructor(private supabase: SupabaseClient) {}
  async upload(bucket, path, file) { /* supabase.storage.from(bucket).upload(path, file) */ }
  getPublicUrl(bucket, path) { /* supabase.storage.from(bucket).getPublicUrl(path) */ }
  async delete(bucket, paths) { /* supabase.storage.from(bucket).remove(paths) */ }
}
```

Factory — `src/lib/services/storage/index.ts`:
```typescript
export async function getStorageService(): Promise<StorageService> {
  const supabase = await createClient();
  return new SupabaseStorageService(supabase);
}
```

### 6. Compositions API — `src/app/api/compositions/route.ts`

**GET**: Session check. If admin/director → `repo.findAll()`; if member → `repo.findLinkedToAnyEvent()`.
**POST**: Session + role check (admin/director) → parse with `compositionSchema` → `repo.create(data)` → 201.

### 7. Compositions CRUD API — `src/app/api/compositions/[id]/route.ts`

**GET**: Session → `repo.findById(id)` → 404 if null. For members, verify composition is linked to an event.
**PUT**: Session + role (admin/director) → parse with `compositionSchema.partial()` → `repo.update(id, data)`.
**DELETE**: Session + role (admin/director) → `repo.delete(id)`.

Follow exact pattern from `src/app/api/events/[id]/route.ts`.

### 8. Attachments API — `src/app/api/compositions/[id]/attachments/route.ts`

**GET**: Session → verify composition exists via CompositionRepo → `AttachmentRepo.findByComposition(id)`.
**POST**: Session + role (admin/director) → verify composition. Two modes:
- JSON body (`isLink: true`): parse with `attachmentSchema`, create record
- FormData (`isLink: false`): extract file + metadata, upload via StorageService to `compositions/{ensembleId}/{compositionId}/{uuid}`, create record with returned URL

### 9. Attachment Delete API — `src/app/api/compositions/[id]/attachments/[attachmentId]/route.ts`

**DELETE**: Session + role → verify composition → fetch attachment → if `!isLink`, delete from storage → delete DB record.

### 10. Event-Compositions API — `src/app/api/events/[id]/compositions/route.ts`

**GET**: Session → verify event → `CompositionRepo.findByEvent(eventId)`.
**POST** (link): Session + role → parse `{ compositionId: z.string().uuid() }` → verify both exist → `repo.linkToEvent()` → 201.
**DELETE** (unlink): Session + role → parse `{ compositionId }` → `repo.unlinkFromEvent()`.

### 11. i18n Keys — Add to all 3 locale files

Under `compositions` add keys:
- `create`, `edit`, `save`, `delete`, `confirmDelete`, `backToCompositions`, `noCompositions`
- `addAttachment`, `deleteAttachment`, `linkUrl`, `uploadFile`, `attachments`
- `addToEvent`, `removeFromEvent`, `selectCompositions`

### 12. UI Components

**`src/components/compositions/composition-card.tsx`** — Card with name, author, duration. Dropdown edit/delete for directors/admins. Links to detail page. Same pattern as `EventCard`.

**`src/components/compositions/composition-list.tsx`** — Grid of CompositionCards. Create button for directors/admins. Empty state. Same pattern as `EventList`.

**`src/components/compositions/composition-form.tsx`** — react-hook-form + zod. Fields: name, author, duration. Submits to API. Create/edit modes. Same pattern as `EventForm`.

**`src/components/compositions/attachment-list.tsx`** — Two sections: Sheets and Audio. Each item is a clickable link (opens in new tab). Delete button for editors. Icons: `FileMusic`/`Headphones`/`ExternalLink`/`Trash2`.

**`src/components/compositions/attachment-upload.tsx`** — Toggle between Link mode (name + URL + type inputs) and File mode (name + file input + type select). Submits to attachments API.

**`src/components/compositions/event-composition-picker.tsx`** — Dialog with checkbox list of all compositions. Checked = linked to event. Toggle immediately calls POST/DELETE on event-compositions API.

### 13. Composition Pages

**`src/app/[locale]/(authed)/compositions/page.tsx`** (MODIFY stub) — Server component. Role check: admin/director gets `findAll()`, member gets `findLinkedToAnyEvent()`. Renders CompositionList.

**`src/app/[locale]/(authed)/compositions/new/page.tsx`** — Role-gated (admin/director). Renders CompositionForm in create mode.

**`src/app/[locale]/(authed)/compositions/[id]/page.tsx`** — Fetch composition + attachments. Renders detail + AttachmentList + AttachmentUpload (if canEdit).

**`src/app/[locale]/(authed)/compositions/[id]/edit/page.tsx`** — Role-gated. Fetch composition. Renders CompositionForm in edit mode.

### 14. Event Detail — Add Compositions Section

**Modify `src/app/[locale]/(authed)/events/[id]/page.tsx`**:
- Fetch linked compositions: `CompositionRepo.findByEvent(event.id)`
- After AttendancePanel + Separator: render linked composition names as links
- If canEdit: show EventCompositionPicker button (also fetch `CompositionRepo.findAll()` for picker)

### 15. Tests

**Repository tests** (mock drizzle):
- `composition-repository.test.ts` — findAll, findById, findByEvent, create, update, delete, linkToEvent, unlinkFromEvent (~8 tests)
- `attachment-repository.test.ts` — findByComposition, create, delete (~4 tests)

**API route tests** (mock repos + session):
- `api/compositions/route.test.ts` — GET role-based, POST auth+validation+creation (~4 tests)
- `api/compositions/[id]/route.test.ts` — GET/PUT/DELETE with auth, 404, validation (~5 tests)
- `api/compositions/[id]/attachments/route.test.ts` — GET, POST link mode (~3 tests)
- `api/compositions/[id]/attachments/[attachmentId]/route.test.ts` — DELETE (~2 tests)
- `api/events/[id]/compositions/route.test.ts` — GET, POST link, DELETE unlink (~4 tests)

**Storage service test**:
- `supabase-storage-service.test.ts` — upload, getPublicUrl, delete (~3 tests)

**Component tests**:
- `composition-list.test.tsx` — renders cards, empty state, create button (~3 tests)
- `attachment-list.test.tsx` — renders sections, delete buttons (~2 tests)

Expected: ~38 new tests (total ~103).

## Key Files (reference)

- `src/lib/db/schema/compositions.ts` — compositions, eventCompositions, attachments tables
- `src/lib/db/repositories/event-repository.ts` — CRUD pattern to follow
- `src/lib/validation/schemas.ts` — compositionSchema, attachmentSchema (already exist)
- `src/lib/services/storage/storage-service.ts` — StorageService interface
- `src/lib/supabase/server.ts` — async `createClient()` for storage service
- `src/app/api/events/[id]/route.ts` — API route pattern (params, error handling, role checks)
- `src/app/api/events/__tests__/route.test.ts` — class-based mock pattern for tests

## Important Notes

- Use Zod v4: catch `ZodError`, access `.issues` not `.errors`
- API routes: `getSessionContext()` + 401; pages: `requireSession()` + redirect
- `eventCompositions` unique on `(eventId, compositionId)` — use onConflictDoNothing for linkToEvent
- Use class-based mocks for repositories in tests
- Attachment deletion must clean up storage when `isLink === false`
- StorageService.getPublicUrl is sync — construct URL from env or cache client

## Verification

1. `npm test` — all tests pass (existing 65 + new ~38)
2. `npm run build` — no TypeScript errors
3. `npm run lint` — no lint issues
4. Manual testing:
   - Create composition → verify in list
   - Add sheet/audio link attachment → verify clickable
   - Edit/delete composition
   - Link composition to event → verify on event detail page
   - Unlink composition from event
   - Member sees only event-linked compositions
