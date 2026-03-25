---
name: Kond Mobile Development Guidelines
description: Specific instructions and rules for developing the React Native Expo mobile application
---

# Kond Mobile Development Guidelines

## 1. Framework & Routing
- Built with **React Native 0.81** and **Expo ~54.0**.
- Uses **Expo Router** for file-based routing located in the `apps/mobile/app/` directory.
- The routing uses group directories: `(auth)`, `(resident)`, `(doorman)`. Ensure pages are placed in the correct group based on the target user persona.

## 2. UI & Styling
- Do not use generic React Native UI libraries. The project uses custom styling defined in `apps/mobile/lib/theme.ts`.
- Components in `apps/mobile/components/` must use this theme for consistency.
- Animations should use `react-native-reanimated`.
- Icons must be imported from `lucide-react-native`.

## 3. Backend Integration
- All Supabase calls must go through the initialized client in `apps/mobile/lib/supabase.ts`.
- Keep business logic out of the UI components. Map data fetching and mutations inside `lib/` service files.

## 4. App Entry Point
- The `app/_layout.tsx` is the root layout handling the `AuthProvider` and the base Stack configuration.

## 5. Deployment
- Use `npm run start` inside the `apps/mobile` workspace to run the development server.
