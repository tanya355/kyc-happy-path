# Fusion Starter

A production-ready full-stack React application template with integrated Express server, featuring React Router 6 SPA mode, TypeScript, Vitest, Zod and modern tooling.

While the starter comes with a express server, only create endpoint when strictly neccesary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations.

## Tech Stack

- **PNPM**: Prefer pnpm
- **UI Framework**: React 19 + TypeScript
- **Routing**: React Router v7
- **Server State**: TanStack Query v5 (`@tanstack/react-query`)
- **Data Tables**: TanStack Table v8 (`@tanstack/react-table`)
- **Client UI State**: Zustand v5
- **Styling**: Tailwind CSS v4
- **Design System**: `@kpmg-us/ad-design-lib` 0.0.25
- **UI Primitives**: Radix UI primitives (`radix-ui`, 1.4.3)
- **Icons**: Lucide React (1.8.0)
- **Component Variants**: `class-variance-authority` (latest)
- **Class Composition**: `clsx` + `tailwind-merge` (0.7.1)
- **Schema Validation**: Zod (4.3.6)
- **Forms**: `react-hook-form` + `@hookform/resolvers` (7.72.1)
- **Charts**: Recharts (3.8.1)
- **Toast Notifications**: Sonner (2.0.7)
- **Backend**: Express server integrated with Vite dev server
- **Testing**: Vitest

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## Key Features

## SPA Routing System

The routing system is powered by React Router v7:

- Route page components live in `client/pages/` (e.g., `Index.tsx` for the home page).
- Routes are defined in `client/AppRoot.tsx` using `<BrowserRouter>`, `<Routes>`, and `<Route>`.
- Import all router APIs from `react-router` (not `react-router-dom`).
- Use `useNavigate`, `useParams`, `useLocation`, and `Link` from `react-router` for navigation and routing helpers.

**Example usage:**

```tsx
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    {/* Add all custom routes above the catch-all "*" route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

See also:

- Route files: `client/pages/`
- Router setup: `client/AppRoot.tsx`

Use navigation helpers as needed:

```tsx
import { useNavigate, useParams, useLocation, Link } from "react-router";
```

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css`
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Express Server Integration

- **Development**: Single port (8080) for both frontend/backend
- **Hot reload**: Both client and server code
- **API endpoints**: Prefixed with `/api/`

#### Example API Routes

- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint

### Shared Types

Import consistent types in both client and server:

```typescript
import { DemoResponse } from '@shared/api';
```

Path aliases:

- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
pnpm dev        # Start dev server (client + server)
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # TypeScript validation
pnpm test          # Run Vitest tests
```

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route

1. **Optional**: Create a shared interface in `shared/api.ts`:

```typescript
export interface MyRouteResponse {
  message: string;
  // Add other response properties here
}
```

2. Create a new route handler in `server/routes/my-route.ts`:

```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: 'Hello from my endpoint!'
  };
  res.json(response);
};
```

3. Register the route in `server/index.ts`:

```typescript
import { handleMyRoute } from "./routes/my-route";

// Add to the createServer function:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Use in React components with type safety:

```typescript
import { MyRouteResponse } from '@shared/api'; // Optional: for type safety

const response = await fetch('/api/my-endpoint');
const data: MyRouteResponse = await response.json();
```

### New Page Route

1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:

```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- Single-port development with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces
