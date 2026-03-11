# Phase 5: Member Management + Profiles

## Context

Phases 1-4 (Auth, Events CRUD, Attendance, Compositions) are complete with 114 passing tests. Phase 5 adds member management (list, detail, invite, role management) and profile editing (own profile, password change, profile picture).

**MemberRepository already exists** (`src/lib/db/repositories/member-repository.ts`) — full CRUD + addRole/removeRole.
**Validation schemas already exist**: `memberProfileSchema` (name, email, phone) and `memberInviteSchema` (email, name, role) in `src/lib/validation/schemas.ts`.
**i18n keys partially exist**: basic keys (title, voiceGroup, role, roles.*) for members, and (title, name, email, phone, picture, changePassword) for profile.
**Auth service exists** but lacks `inviteUser()` method. No service-role Supabase client exists — needs `SUPABASE_SERVICE_ROLE_KEY` + admin client.

## Permission Rules

| Action | Member | Director | Admin |
|--------|--------|----------|-------|
| View member list | All | All | All |
| View member detail | All | All | All |
| Edit own profile | Yes | Yes | Yes |
| Edit other members | No | voiceGroup only | Yes |
| Invite members | No | No | Yes |
| Delete members | No | No | Yes |
| Manage roles | No | No | Yes |
| Change own password | Yes | Yes | Yes |
| Upload own picture | Yes | Yes | Yes |

## Implementation Steps

### 1. Validation Schema Extensions — `src/lib/validation/schemas.ts`

Modify existing `memberProfileSchema` to include voiceGroup. Add new schemas:

```typescript
// Extend existing
export const memberProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  voiceGroup: z.enum(["S", "A", "T", "B"]).nullable().optional(),
});

// New schemas
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const memberRolesSchema = z.object({
  roles: z.array(z.enum(["admin", "director", "member"])).min(1),
});
```

### 2. Auth Service — Add `inviteUser`

**`src/lib/services/auth/auth-service.ts`** — add to interface:
```typescript
inviteUser(email: string, password: string): Promise<AuthUser>;
```

**`src/lib/supabase/admin.ts`** (NEW) — create admin client using `SUPABASE_SERVICE_ROLE_KEY`:
```typescript
import { createClient } from "@supabase/supabase-js";
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

**`src/lib/services/auth/supabase-auth-service.ts`** — implement `inviteUser`:
```typescript
async inviteUser(email: string, password: string): Promise<AuthUser> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  // ...
}
```

**`.env.example`** — add `SUPABASE_SERVICE_ROLE_KEY=key`

### 3. MemberRepository — Add `setRoles` — `src/lib/db/repositories/member-repository.ts`

```typescript
async setRoles(memberId: string, roles: UserRole[]): Promise<void> {
  await this.db.delete(memberRoles).where(eq(memberRoles.memberId, memberId));
  if (roles.length > 0) {
    await this.db.insert(memberRoles).values(
      roles.map((role) => ({ memberId, role }))
    );
  }
}
```

### 4. API Routes

#### 4a. `src/app/api/members/route.ts`
- **GET**: Session check → `repo.findAll()` → return all members
- **POST**: Session + admin role → parse `memberInviteSchema` → generate temp password (`crypto.randomUUID().slice(0,12)`) → `authService.inviteUser(email, tempPassword)` → `repo.create(...)` → `repo.addRole(memberId, role)` → return member + tempPassword (201)

#### 4b. `src/app/api/members/[id]/route.ts`
- **GET**: Session → `repo.findById(id)` → 404 if null
- **PUT**: Session → admin can update any member; director can update voiceGroup only (of any member); member can update self (name, email, phone, voiceGroup). Parse `memberProfileSchema.partial()` → filter allowed fields by role → `repo.update(id, data)`
- **DELETE**: Session + admin → cannot delete self → `repo.delete(id)`

#### 4c. `src/app/api/members/[id]/roles/route.ts`
- **PUT**: Session + admin → parse `memberRolesSchema` → cannot remove own admin role → `repo.setRoles(id, roles)` → return updated member

#### 4d. `src/app/api/profile/route.ts`
- **GET**: Session → `repo.findById(session.member.id)` → return
- **PUT**: Session → parse `memberProfileSchema` → `repo.update(session.member.id, data)`

#### 4e. `src/app/api/profile/password/route.ts`
- **PUT**: Session → parse `changePasswordSchema` → verify current password via `authService.signIn(email, currentPassword)` (400 if wrong) → `authService.updatePassword(newPassword)`

#### 4f. `src/app/api/profile/picture/route.ts`
- **PUT**: Session → FormData with `file` → upload to `avatars/{ensembleId}/{memberId}/{uuid}` via StorageService → if old picture exists, delete it → `repo.update(session.member.id, { profilePicture: url })`

### 5. i18n Keys — Add to all 3 locale files

Under `members` add:
- `invite`, `inviteDescription`, `temporaryPassword`, `temporaryPasswordNote`
- `deleteMember`, `confirmDelete`, `editMember`, `backToMembers`, `noMembers`
- `manageRoles`, `cannotRemoveOwnAdmin`, `cannotDeleteSelf`
- `voiceGroups.S`, `voiceGroups.A`, `voiceGroups.T`, `voiceGroups.B`, `allGroups`

Under `profile` add:
- `changePicture`, `currentPassword`, `newPassword`, `confirmPassword`
- `passwordMismatch`, `passwordChanged`, `profileUpdated`, `invalidCurrentPassword`, `save`

### 6. UI Components

**`src/components/members/voice-group-select.tsx`** — Reusable Select for S/A/T/B with nullable "unassigned" option.

**`src/components/members/member-card.tsx`** — Card with name, email, voice group Badge, role Badges. Links to `/members/{id}`. Pattern follows EventCard.

**`src/components/members/member-list.tsx`** — Grid of MemberCards with voice group filter tabs (All/S/A/T/B). Invite button for admins. Pattern follows EventList.

**`src/components/members/invite-member-dialog.tsx`** — Dialog form using memberInviteSchema. On success shows generated temp password. Calls router.refresh().

**`src/components/members/role-manager.tsx`** — Checkboxes for admin/director/member. PUTs to `/api/members/{id}/roles`. Disables own admin removal.

**`src/components/profile/profile-form.tsx`** — react-hook-form + memberProfileSchema. Fields: name, email, phone, voiceGroup (VoiceGroupSelect). PUTs to `/api/profile`. Includes picture upload section (PUTs to `/api/profile/picture`).

**`src/components/profile/change-password-form.tsx`** — Fields: currentPassword, newPassword, confirmNewPassword (client-side match validation). PUTs to `/api/profile/password`.

### 7. Pages

**`src/app/[locale]/(authed)/members/page.tsx`** (MODIFY stub) — Server component. `requireSession()` → `repo.findAll()` → render MemberList with isAdmin flag.

**`src/app/[locale]/(authed)/members/[id]/page.tsx`** (NEW) — Server component. Fetch member + show detail. Admin sees RoleManager. Admin/self sees edit capability.

**`src/app/[locale]/(authed)/profile/page.tsx`** (MODIFY stub) — Server component. Fetch own member data → render ProfileForm + ChangePasswordForm.

### 8. Tests

**Repository tests:**
- `member-repository.test.ts` — findAll, findById, create, update, delete, addRole, setRoles (~8 tests)

**API route tests (mock repos + session):**
- `api/members/route.test.ts` — GET auth, GET list, POST auth, POST 403, POST creates, POST validation (~6 tests)
- `api/members/[id]/route.test.ts` — GET/PUT/DELETE with auth, 404, role checks (~8 tests)
- `api/members/[id]/roles/route.test.ts` — PUT auth, 403, sets roles, prevents self-lockout (~4 tests)
- `api/profile/route.test.ts` — GET/PUT auth + success (~4 tests)
- `api/profile/password/route.test.ts` — PUT auth, success, wrong current password (~3 tests)
- `api/profile/picture/route.test.ts` — PUT auth, uploads, 400 no file (~3 tests)

**Component tests:**
- `member-list.test.tsx` — renders cards, empty state, invite button visibility (~3 tests)
- `profile-form.test.tsx` — renders prefilled, submits (~2 tests)

Expected: ~41 new tests (total ~155).

## Key Files (reference)

- `src/lib/db/repositories/member-repository.ts` — existing CRUD + roles
- `src/lib/services/auth/auth-service.ts` — interface to extend
- `src/lib/services/auth/supabase-auth-service.ts` — implementation to extend
- `src/lib/validation/schemas.ts` — existing schemas to extend
- `src/lib/services/storage/index.ts` — getStorageService() for picture upload
- `src/app/api/events/[id]/route.ts` — API route pattern
- `src/app/api/events/__tests__/route.test.ts` — test pattern
- `src/components/events/event-card.tsx` — card component pattern
- `src/components/events/event-form.tsx` — form component pattern

## Important Notes

- Invite flow uses `supabase.auth.admin.createUser()` which requires `SUPABASE_SERVICE_ROLE_KEY` — must add to `.env.local` and `.env.example`
- Admin cannot delete self or remove own admin role (lockout prevention)
- Directors can only change voiceGroup of other members, not other fields (PRD rule)
- Password change verifies current password via `signIn()` attempt
- Profile picture uses StorageService with path `avatars/{ensembleId}/{memberId}/{uuid}`; old pictures deleted on replacement
- `memberProfileSchema` extended with optional nullable `voiceGroup`

## Verification

1. `npm test` — all tests pass (existing 114 + new ~41)
2. `npm run build` — no TypeScript errors
3. `npm run lint` — no lint issues
