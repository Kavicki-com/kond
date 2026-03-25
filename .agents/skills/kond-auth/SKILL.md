---
name: Kond Authentication Flow
description: Specific instructions for user authentication and session management
---

# Kond Authentication Flow

## 1. Global State
- Both the Web and Mobile apps rely on a global `AuthContext` to maintain the user's session state.
- Use the `useAuth()` hook to access the current session, user profile, and loading state.

## 2. Route Protection
- **Web:** Use the `ProtectedRoute` component wrapping the `DashboardLayout` in `App.tsx` to guard authenticated routes. If a user is not logged in, redirect them to `/login`.
- **Mobile:** Protect routes using Expo Router layout files (`_layout.tsx`). The layout should check the session state and redirect to `(auth)` if unauthenticated, or `(resident)`/`(doorman)` if authenticated based on their role.

## 3. Auth Actions
- Login, registration, and password recovery should trigger the respective Supabase Auth API calls inside isolated files (e.g., `services/registration.ts`).
- Ensure graceful error checking when tokens are invalid or expired.
