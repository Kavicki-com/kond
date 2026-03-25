---
name: Kond Architecture Guidelines
description: Core architectural rules and structure for the Kond monorepo (Mobile + Web)
---

# Kond Architecture Guidelines

## 1. Monorepo Structure
This repository contains two main applications:
- **`apps/mobile`**: A React Native application built with Expo.
- **`apps/web`**: A React application built with Vite.

Both applications share **Supabase** as the backend for authentication and database management.

## 2. Core Principles
- **Avoid Duplication**: When working on features that span both web and mobile, consider if the logic can be shared or if it must remain distinct. Currently, `types.ts` and Supabase clients are duplicated; keep them synchronized if modified.
- **Service Layer**: Business logic and external API calls (Supabase, emails, payments) should be encapsulated in the respective service folders:
  - Mobile: `apps/mobile/lib/`
  - Web: `apps/web/src/services/`
- **Context API for State**: Both apps use a global `AuthContext` to manage user sessions and authentication state.

## 3. Tech Stack Consistency
- Both apps use **React 19.1.0**.
- **Icons**: `lucide-react` (Web) and `lucide-react-native` (Mobile). Use consistent icon names when implementing shared UI concepts.

## 4. Workflows
When adding a new feature:
1. Define the Supabase database schema changes (if any).
2. Implement the API/Service functions in the respective `lib`/`services` folder.
3. Update the UI components and pages/screens in the corresponding app.
4. Ensure access controls (Role-Based Access Control) are enforced on the new routes.
