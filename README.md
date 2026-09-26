# Routim — AccessQuest

**Small reports. More accessible journeys.**

Routim is a Raktim-inspired product identity for AccessQuest: a fictional-campus accessibility MVP that turns structured barrier reports into explainable route changes.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Build checks:

```bash
npm run verify
npm run build
npm start
```

> In this environment `npm install` timed out, so the final build must be verified on the target laptop.

## What is new in this edition

- **Log in / Sign up:** the header now opens a local demo account flow. Accounts are stored in this browser with a SHA-256 password hash and a local session; this is intentionally labelled demo-only. Production should use Supabase Auth or another server-side identity provider.
- **Example-first tutorials:** each tutorial now includes a concrete campus example, numbered steps, and a **Try it now** action that jumps to the exact feature. Example: **Main Gate → Library → broken lift → longer fallback**.
- **Tutorial captions + posters:** all three built-in videos keep captions and poster frames.

- **Five routing strategies:** Shortest available, Known step-free, Evidence-first, Avoid lifts, Ramp-preferred.
- **Shorter ≠ better guardrail:** strict step-free never trades stairs/unknown access for distance. Evidence-first adds a large uncertainty penalty instead of treating unknown as accessible.
- **Three route alternatives:** the UI exposes trade-offs rather than hiding every route except one.
- **Structured graph evidence:** a report must point to an exact edge; active reports conservatively exclude that edge until resolved.
- **Activity centre:** report, confirmation, resolution, route-change and mission events appear as notifications.
- **Browser notifications:** users can opt in to native browser alerts on supported browsers.
- **Cross-tab sync:** `BroadcastChannel` keeps open tabs on the same browser in sync.
- **Optional shared mode:** Supabase Auth + REST polling share accounts, owner activity, reports and notifications across devices every 5 seconds. Owner access is role-gated by RLS; no service-role credential belongs in the client.
- **Mission integrity:** points are awarded once per participant; obstacle missions stay locked until the linked report is resolved.
- **Photo validation:** PNG/JPEG/WebP, maximum 3 MB; local mode stores only the filename.
- **Accessibility:** semantic controls, visible focus, `aria-live`, text route list, reduced-motion support and no live-location request.

## Storage modes

### Local demo (default)
No credentials are needed. Reports, missions, points and notifications stay in browser storage and are not shared across devices.

### Shared Supabase mode — real multi-device accounts + owner dashboard
1. Create a Supabase project.
2. In **Authentication → Providers → Email**, choose whether email confirmation is required. For a live event demo, disabling confirmation can reduce friction.
3. Run `supabase/schema.sql` in the SQL editor.
4. Copy `.env.example` to `.env.local` and set the browser-safe project URL and anon key.
5. Restart Next.js.
6. Sign up with your **owner email** once.
7. In Supabase SQL editor, promote that account exactly once:

```sql
update public.profiles
set role = 'owner'
where email = 'YOUR_OWNER_EMAIL';
```

8. Sign out/in on the owner laptop. The header will show **CLOUD ACCOUNT · 5s SYNC** and the account menu will expose **Owner dashboard · live users**.

The owner dashboard is protected by the database role and RLS: ordinary users cannot read the full user/activity tables. A new signup creates an owner notification; reports create owner notifications too. The dashboard polls shared data every 5 seconds and supported browsers can show native notifications after permission is granted.

**Security note:** never expose a Supabase `service_role` key in client code. The included RLS policies protect owner reads. For a public production launch, also add rate limits, abuse protection, verified email/MFA, audit retention, image storage policies and a server-side push delivery worker.

## Core route rules

- Standard mode excludes blocked edges.
- Known step-free excludes stairs, unknown-accessibility edges and active barriers.
- Evidence-first strongly penalises unknown access and stairs instead of silently treating them as accessible.
- Avoid lifts excludes lift edges.
- Ramp-preferred gives ramps a preference and strongly penalises stairs/uncertainty.
- Active reports conservatively block their exact graph edge even when unverified.
- Resolved reports restore the edge.
- Route output is a limited preference based on known campus data, not a safety or universal accessibility guarantee.

## 90-second hackathon demo

1. Click **Run judge scenario**.
2. Gate → Library shows the short known step-free route through the working lift.
3. Report **Broken lift → Library lift**.
4. The graph edge becomes unavailable and the route expands to the longer known step-free loop. The UI shows the distance delta and evidence explanation.
5. Switch participant to **Arjun** and confirm the observation.
6. Open the notification centre to show the activity event and verified contribution count.
7. Use **Moderator: resolve**.
8. The lift segment becomes available and the short route returns.
9. Open **Missions** and complete the now-unlocked resolved-obstacle mission.
10. Finish with the **Shorter ≠ better** guardrail: Routim optimises only within the selected evidence/access rules.

## Architecture

- `src/lib/campus.ts` — fictional 10-node graph, typed edges, routing strategies, alternatives, seeded demo data.
- `src/lib/shared.ts` — optional Supabase REST adapter and mapping layer.
- `src/app/page.tsx` — planner, SVG map, route alternatives, report workflow, verification, notifications, missions and demo mode.
- `src/app/globals.css` — responsive visual system, focus states and reduced-motion rules.
- `supabase/schema.sql` — optional shared tables and demo RLS policies.

## Owner dashboard and cross-device notifications

In Local demo mode, account data stays on one browser. In Shared mode, the authenticated owner can open **Owner dashboard · live users** from the account menu to see names, emails, roles, last-seen times and recent activity from every device. New account creation and barrier reports create owner-targeted notifications in Supabase. The owner's browser polls for those notifications and can display native browser alerts after permission is granted. This is near-real-time polling, not a WebSocket push service.

## Local demo accounts

The **Log in / Sign up** dialog is functional without a backend so judges can try an account flow offline. It stores only a password hash and session in browser storage. It is **not production authentication**: there is no server-side identity, password reset, email verification, MFA or account recovery.

For production, connect the UI to Supabase Auth and enforce authorization server-side/RLS.

## Tutorial examples

The three videos are paired with step-by-step examples so a first-time user can immediately reproduce the workflow:

1. **Plan a route — Main Gate → Library**
   - Select the two locations.
   - Choose Known step-free.
   - Report the Library lift as broken and observe the longer fallback.
2. **Report a barrier — Broken Library lift**
   - Choose Broken lift.
   - Select Library lift as the exact affected segment.
   - Submit and watch the graph exclude that edge.
3. **Notifications & verification — confirm a demo observation**
   - Enable browser alerts.
   - Switch demo participant.
   - Confirm once; duplicate confirmations are blocked.

## Notification reality check

The default local build cannot notify people on other devices because browser storage is local. The optional Supabase mode makes reports and notification events shared across devices; each person must still grant browser notification permission on their own device. For production-grade push notifications, add Web Push/FCM/APNs with server-side delivery and authenticated subscriptions.

## Known limitations

- Fictional schematic map, not a real campus map.
- Local mode is browser-only.
- Shared mode uses polling rather than a realtime websocket channel.
- Demo participant switching is not production authentication.
- Photos are validated but not uploaded in local mode.
- Supabase demo policies are intentionally permissive and must be hardened before production.
- No live location, paid map API, or personal information is required.

## Production-readiness upgrades in this build
- Security headers disable framing, MIME sniffing, and browser access to geolocation/camera/microphone unless the app explicitly changes those policies.
- `GET /api/health` provides a no-store health/version endpoint for smoke checks.
- A lightweight service worker provides an offline shell/cache fallback; it never stores reports or personal data in the service worker cache.
- Root-level loading and recovery screens prevent blank states during navigation or unexpected client errors.
- The optional Supabase path remains compatible with browser-safe anon keys; never place a `service_role` secret in `.env.local` exposed to the client.
- For production deployment, pair Supabase RLS with authenticated identities, server-side validation, object storage for photos, audit logs, rate limiting, and Web Push/FCM credentials kept server-side.

### Production checklist
1. Create a Supabase project and run `supabase/schema.sql` after replacing the demo-open policies with authenticated RLS.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the deployment environment.
3. Add authenticated users and replace demo participant switching.
4. Store uploaded images in a private bucket and issue signed URLs.
5. Add server-side report validation, moderation and audit events.
6. Configure Web Push/FCM from a server-side worker for true cross-device notifications.
7. Run `npm run verify`, `npm run build`, then `npm start` before judging.

## Advanced operations in this edition

- **What-if Lab:** temporarily block any campus graph edge and preview the resulting route without creating a report or changing stored demo data.
- **Route Passport:** export the selected route as a local JSON evidence package containing distance, segments, access metadata and verification timestamps. It contains no live location or personal information.
- **Alternative-route comparison:** up to three route candidates remain visible so users can compare distance and routing trade-offs rather than being shown a single opaque answer.
- **Evidence-first routing:** uncertainty is explicitly penalised; unknown accessibility is never silently treated as accessible in strict step-free mode.
- **Conservative barrier treatment:** an active structured report blocks its exact edge before confirmation, with the UI clearly explaining that this is a conservative demo policy rather than proof of the observation.

### Judge-facing differentiators

1. Demonstrate the **What-if Lab** before submitting a report: judges can see the routing engine react to a hypothetical barrier without polluting the dataset.
2. Submit the actual report and show the same graph change becoming persistent.
3. Use the **Route Passport** to demonstrate that the route decision is explainable and exportable rather than a black box.
4. Keep the tutorial videos visible for first-time users and the activity centre open during the report → reroute → confirm → resolve story.

## Advanced intelligence tools
- **Recovery Planner** simulates resolving each active report and ranks which resolution would produce the shortest currently available route. It never changes stored reports.
- **Access Evidence Lens** reports the percentage of current route segments marked known step-free, plus unknown segments and campus records older than seven days.
- These are decision-support views, not safety scores, repair-time predictions, or guarantees of accessibility.

## Account & owner usage view
- The header now uses a compact account control with avatar, session count, account settings, sign-out, and a **Who has used Routim?** owner-style demo view.
- Local demo accounts store a hashed password, creation time, last-seen timestamp and session count in this browser.
- New sign-ups create a local activity notification; report, route and mission events remain visible in the activity centre.
- The owner usage view is explicitly **demo-only** in Local demo mode: it cannot see users on another device.
- Production must replace local account storage with Supabase Auth, protected server-side owner/admin authorization, an audit/event table, and server-triggered push/email notifications. Never expose an admin/service-role key in client code.
