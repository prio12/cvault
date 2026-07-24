# CVault

A CV management system built for my Intern Developer course project at Itransition. Candidates build reusable profiles and generate CVs tailored to specific job positions; Recruiters define those positions using a shared library of attributes.

Built with the JS/React track: TypeScript, React 19, Express, PostgreSQL (via Supabase), Prisma.

## The idea

Three pieces, all connected:

- **Attribute Library** — Recruiters define reusable fields once (e.g. "English Level", dropdown, with options). No duplicating the same field across positions.
- **Positions** — Recruiters build position templates by picking attributes from the library. Any Recruiter can edit any position, there's no ownership — it's a shared pool.
- **CV Generation** — Candidates fill in their profile using attributes from the library, then generate a CV for a position. The CV pulls in whatever's already filled, highlights what's missing in red, lets you fill the rest right there, and publishing makes it visible to Recruiters.

Editing a value on a CV updates the same underlying profile value — there's only ever one master copy per attribute, never a separate CV copy.

## What's actually built

- Auth: email/password + Google + GitHub OAuth
- Roles: Candidate / Recruiter / Admin, enforced server-side via middleware
- Attribute Library — full CRUD, category filter, prefix search, dropdown options
- Positions — CRUD, duplicate, attribute picker, "Submitted CVs" list for Recruiters
- Profile — Me tab (autosave + optimistic locking), Info tab (attribute values), CVs tab
- CV Generation — create, auto-merge from profile + position, inline editing, per-type validation, Publish gating (blocked until every required field is filled)
- Responsive layout, consistent nav, Zinc + Emerald theme

## What's not built (on purpose)

Given the timeline, I prioritized the three "killer features" the spec calls out, plus auth/profile/roles, over spreading thin across everything. Cut, deliberately, not half-built:

- Discussions, Likes
- Main page (stats, tag cloud, popular positions)
- i18n (second language)
- Theme toggle UI (the CSS theme is there, just no switch yet)
- Global full-text search in the header
- Access Rules (position-level filters — currently all positions are just public/restricted)
- Admin role-management UI — roles are assigned directly in the DB for now
- Projects tab

The schema (`prisma/schema.prisma`) actually models most of this already — `Project`, `Tag`, `DiscussionPost`, `CVLike`, `AccessRule` are all there. I just didn't build the API/UI for them in the time I had.

## Stack

**Backend**: Express, TypeScript, Prisma (client generated to `src/generated`, non-default path), Passport.js (Google + GitHub strategies), JWT, PostgreSQL via Supabase.

**Frontend**: Vite, React 19, TypeScript, Zustand, React Router v7, Tailwind v4, DaisyUI v5.

## Running locally

**Server**

```bash
cd server
npm install
npx prisma generate
npm run dev
```

**Client**

```bash
cd client
npm install
npm run dev
```

You'll need a `.env` in `server/` with `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`/`SECRET`/`CALLBACK_URL`, `GITHUB_CLIENT_ID`/`SECRET`/`CALLBACK_URL`, and `CLIENT_URL`. Client needs `VITE_API_URL` pointing at the server.

## Notes on a few decisions

- **No version field on CV attribute edits** — unlike Profile (autosave, real conflict risk) or Position (edited by any Recruiter), a CV is only ever edited by its one owning Candidate. Last-write-wins is fine there; optimistic locking would be solving a problem that doesn't exist.
- **No per-row buttons anywhere** — everything's checkbox + toolbar, per the spec's requirement.
- **Server is the actual security boundary**, not the UI — buttons are hidden by role client-side for cleaner UX, but every write endpoint checks the role again server-side regardless of what the UI shows.
