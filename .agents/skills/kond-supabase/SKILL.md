---
name: Kond Supabase Integration
description: Specific instructions for interacting with Supabase in the Kond monorepo
---

# Kond Supabase Integration Guidelines

## 1. Client Initialization
- **Mobile:** Use the client exported from `apps/mobile/lib/supabase.ts`.
- **Web:** (Currently duplicated logic) Use the local Supabase client initialization. If `packages/shared-core` is created in the future, use the shared client.

## 2. Data Fetching & Mutations
- **Never** write raw Supabase `.select()` or `.insert()` queries directly inside React components or screens.
- **Service Layer Mandatory:** All Supabase interactions must be encapsulated in their respective service files:
  - Mobile: `apps/mobile/lib/`
  - Web: `apps/web/src/services/`
- Return typed data or structured errors from the service layer to the UI.

## 3. Real-time Subscriptions
- When needing real-time updates, encapsulate the subscription logic inside a custom React Hook (e.g., `useRealtimeResidents`) that internally calls the Supabase service functions.
- Always clean up subscriptions on component unmount to prevent memory leaks.
