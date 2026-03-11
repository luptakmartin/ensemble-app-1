# Phase 6: Calendar View

## Context
The events page currently shows events in a card-based list with upcoming/past tabs. Phase 6 adds a FullCalendar month view as an alternative view, with event color-coding by type and a click popover for event summary + quick attendance toggle. Translation keys (`cardView`, `calendarView`) already exist in all 3 locales.

## Steps

### 1. Install FullCalendar packages
```bash
npm install @fullcalendar/core @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
```

### 2. Create `src/components/events/calendar-event-popover.tsx`
- Popover shown when clicking a calendar event
- Shows: event name, type badge (reuse `EventTypeBadge`), date/time, place
- Link to event detail page
- Quick presence toggle using `PresenceButton` (fetch current user's attendance status via `/api/events/[id]/attendance`)
- Uses a simple positioned div as popover

### 3. Create `src/components/events/event-calendar.tsx`
- Client component wrapping `@fullcalendar/react` with `dayGridPlugin` and `interactionPlugin`
- Props: `events: Event[]`, `canEdit: boolean`
- Map events to FullCalendar format: `{ id, title, start (from event.date), backgroundColor (from typeColorMap), extendedProps: { event } }`
- Color-code events using the same `typeColorMap` from `event-type-badge.tsx` (extract to shared constant)
- Configure FullCalendar locale: map `useLocale()` -> FullCalendar locale (`cs`, `sk`, `en-gb`)
- On event click: show `CalendarEventPopover`
- On date click (if `canEdit`): navigate to `/events/new?date=YYYY-MM-DD`

### 4. Modify `src/components/events/event-list.tsx`
- Add a top-level view toggle (Cards | Calendar) above the existing upcoming/past tabs
- Use a simple button group with icons (Grid3x3 for cards, Calendar for calendar)
- When "Calendar" is selected, render `EventCalendar` with all events (upcoming + past combined)
- When "Cards" is selected, render existing tabs layout
- Store view preference in `useState` (no persistence needed for MVP)

### 5. Modify `src/app/[locale]/(authed)/events/page.tsx`
- Pass all events (both upcoming and past) as a combined `allEvents` prop to `EventList` for the calendar view

### 6. Extract shared type color map
- Export `typeColorMap` from `event-type-badge.tsx` for reuse by `EventCalendar`
- Create a `calendarColorMap` that maps event types to solid hex colors for calendar backgrounds

### 7. Write tests
- `src/components/events/__tests__/event-calendar.test.tsx` — renders FullCalendar, passes correct props, handles event click
- `src/components/events/__tests__/calendar-event-popover.test.tsx` — renders event info, presence button

## Key Files
- `src/components/events/event-list.tsx` — modify (add view toggle)
- `src/components/events/event-calendar.tsx` — create
- `src/components/events/calendar-event-popover.tsx` — create
- `src/components/events/event-type-badge.tsx` — extract color map for reuse
- `src/app/[locale]/(authed)/events/page.tsx` — modify (pass allEvents)
- `src/lib/i18n/messages/{cs,en,sk}.json` — already have `cardView`/`calendarView` keys

## Reuse
- `EventTypeBadge` component (`src/components/events/event-type-badge.tsx`)
- `PresenceButton` component (`src/components/attendance/presence-button.tsx`)
- `typeColorMap` from `event-type-badge.tsx`
- Tabs component from `src/components/ui/tabs.tsx`
- `Link` from `src/lib/i18n/routing`
- date-fns locale mapping pattern from `event-card.tsx`

## Verification
1. `npm run build` — no TypeScript errors
2. `npm run lint` — no lint issues
3. `npm test` — all tests pass
4. Manual: toggle between card/calendar views on events page
5. Manual: click an event in calendar -> popover with details + presence toggle
6. Manual: verify calendar locale switches with cs/sk/en
7. Manual: check responsive behavior on mobile
