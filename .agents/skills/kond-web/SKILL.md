---
name: Kond Web Development Guidelines
description: Specific instructions and rules for developing the React Vite web application
---

# Kond Web Development Guidelines

## 1. Framework & Routing
- Built with **React 19** and **Vite**.
- Uses **react-router-dom** for declarative routing, orchestrated in `apps/web/src/App.tsx`.
- The `ProtectedRoute` component is used to restrict access to the `/dashboard/*` routes. Ensure new private routes are placed appropriately.

## 2. UI & Styling
- Uses vanilla CSS located in `apps/web/src/index.css` for applying global styles and variables.
- Icons must be imported from `lucide-react`.
- Charts and data visualization should use `recharts`.

## 3. Backend & Services Integration
- `apps/web/src/services/` contains distinct service files for specialized tasks and standard API calls:
  - `email.ts` (using `@emailjs/browser`)
  - `payment.ts` (using `@mercadopago/sdk-react`)
  - `registration.ts`
- Ensure any new external integration is encapsulated into its own service file.

## 4. Directory Structure
- `pages/`: Page-level components.
- `layouts/`: Shared layout wrappers (e.g., `DashboardLayout.tsx`).
- `contexts/`: React Context providers (`AuthContext.tsx`).

## 5. Workspaces
- Run the web app using `npm run dev` in the `apps/web` workspace directory.
