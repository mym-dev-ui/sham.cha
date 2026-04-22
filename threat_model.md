# Threat Model

## Project Overview

Sham Cash is a Next.js 14 App Router application deployed as a static export (`next.config.js` sets `output: 'export'`). In production it is a browser-only registration flow plus a dashboard UI for viewing and manipulating visitor records. There is no server-side API layer, database, webhook handler, or authenticated backend surface in this repo; persistent state is stored in the browser with `localStorage`, and the active registration flow is tracked with `sessionStorage`.

Production scope for this scan is limited to the static site delivered to end users. Per platform assumptions, TLS is handled by the deployment platform and the mockup sandbox is not production.

## Assets

- **Visitor PII** — full name, phone number, ID number, and address collected during registration. Exposure would reveal sensitive personal data.
- **Account-style credentials and codes** — email address, password, security code, and verification code fields represented in the registration data model. Even if this app is currently static-only, collecting or persisting these values insecurely would create a credential-handling risk.
- **Registration state** — visitor progress, completion state, and transfer actions exposed in the dashboard. Tampering can falsify workflow state and expose previously entered data on shared devices.

## Trust Boundaries

- **Browser route boundary** — all pages are directly reachable by the client. Because there is no backend authorization layer, any access control must be enforced in the client or not at all.
- **User input to browser storage** — registration fields cross from transient form state into `sessionStorage` and `localStorage`. Once persisted, any script running on the origin and any later user of the same browser profile can potentially access them.
- **Visitor flow to dashboard boundary** — the same stored visitor data is later rendered in `/dashboard`, which acts like an operator/admin view despite having no authentication boundary in this codebase.

## Scan Anchors

- **Production entry points:** `app/page.tsx`, `app/registration/**`, `app/password-reset/page.tsx`, `app/dashboard/page.tsx`
- **Highest-risk code areas:** `contexts/VisitorContext.tsx` (persistent storage), `app/dashboard/page.tsx`, `app/registration/step-2/page.tsx`, `app/registration/step-3/page.tsx`, `app/registration/step-4/page.tsx`
- **Public vs authenticated vs admin surfaces:** all routes are public in this repo; `/dashboard` behaves like an admin surface but has no server-side protection
- **Dev-only / usually out of scope:** `.next/`, `out/`, `node_modules/`, attached scratch files under `attached_assets/`

## Threat Categories

### Information Disclosure

The main confidentiality risk is client-side persistence of sensitive registration data. This project stores visitor records in `localStorage`, and the stored object model includes identity data plus password/security-code fields. The application must not persist credentials or sensitive PII in plaintext browser storage longer than necessary, and admin-style views must not expose stored records to any subsequent user of the same browser session or profile.

### Tampering

Because the browser is the only execution environment, all workflow state can be modified by the user. Route progression, current step, and visitor completion state must be treated as untrusted client data. Security-sensitive decisions must not rely on client-only step indicators, hardcoded verification values, or local state transitions if the application later gains real backend effects.

### Spoofing / Elevation of Privilege

This repo has no real authentication system, but `/dashboard` is an operator-style surface that displays and manipulates stored visitor records. If the app is used in shared-browser or kiosk-style workflows, any user who can open the route can act as an operator for data already stored in that browser. Any future production version must enforce operator authentication and authorization outside the client.
