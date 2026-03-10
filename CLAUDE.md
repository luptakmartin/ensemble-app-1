# Project Overview

An application to manage ensemble events and track member attendance for the musical ensemble. Primarily it will support singing choir, later will be extended to general music ensemble (instruments). The app supports different user roles and allows planning, communication, and record-keeping of rehearsals and concerts.

# Key Documents
- `docs/PRD.md` — Full product requirements and functional specification
- `docs/TECH_STACK.md` — Technology choices, architecture decisions, coding guidelines
- `docs/PLAN.md` — Implementation plan and phases

Read these documents before starting any feature work.

# Tech Stack

-   Next.js (App Router) + TypeScript
-   Supabase (PostgreSQL + Auth + Storage)
-   PWA architecture installable to Android
-   Czech default language, with full i18n support (CS/SK/EN)

# Development
- Package manager: npm
- Run dev server: `npm run dev`
- Run tests: `npm test`
- Lint: `npm run lint`