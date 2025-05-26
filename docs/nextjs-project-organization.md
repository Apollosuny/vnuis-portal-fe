Below is the updated Next.js Project Organization Guide with a strict requirement to use Luxon for all date/time operations and no other date libraries.

1. Project Structure Overview

Your Next.js application follows a well-organized structure that separates concerns:

apps/web/
├── api/ # API client functions
├── app/ # Next.js app router pages
├── clients/ # Client-side page components
├── components/ # Reusable UI components
├── configs/ # Configuration files (axios, etc.)
├── hooks/ # Custom React hooks
├── lib/ # Utility libraries (including Luxon date/time wrappers)
├── stores/ # State management
├── types/ # TypeScript type definitions
└── utils/ # Utility functions (date/time helpers must use Luxon)

Date/Time Handling: All date and time logic must use Luxon. No other libraries (e.g., date-fns, Moment.js) are permitted.

2. Routing and Page Structure

Using App Router

Your project uses Next.js App Router. Each route corresponds to a directory under apps/web/app/:
• Each page is defined by a page.tsx file in its corresponding route directory
• Layout components go in layout.tsx files
• For dynamic routes, use folders with square brackets (e.g., [id])

Client Components vs. Server Components
• Mark client components with 'use client' directive at the top of the file
• Keep server components as the default (no directive needed)
• Place client-side logic in clients/ directory for better separation

3. Components Organization

Component Types 1. Page Components:
• Live in app/[route]/page.tsx
• Keep these minimal, focused on layout and importing client components 2. Client Components:
• Live in clients/[feature]/ directory
• Handle client-side interactivity, state management
• Each feature should have its own directory 3. Shared Components:
• Live in components/ directory
• Organized by feature or purpose
• Reuse across multiple pages 4. UI Components:
• From your UI package at packages/ui/src/components/
• Basic building blocks (buttons, inputs, etc.)

Guards

Use guard components for authentication/authorization:
• Place in components/guards/
• Use for protecting routes based on user state

4. Date and Time Utilities

Create all date/time helpers using Luxon. Wrap common operations in your own functions under lib/datetime/ or utils/datetime/:

// utils/datetime/format.ts
import { DateTime } from 'luxon';

export function formatDate(iso: string, fmt = 'DDD') {
return DateTime.fromISO(iso).toFormat(fmt);
}

export function nowUtc() {
return DateTime.utc();
}
// ... other wrappers: parsing, interval, diff, timezone conversion

    •	Do not import or use any other date libraries in the project.
    •	Ensure your ESLint or build scripts prohibit importing non-Luxon date packages.

5. State Management

Zustand for Global State

Your project uses Zustand for global state management:
• Store definitions belong in stores/ directory
• Each store should be in a separate file
• Use persist middleware for persistent state

Example pattern from your reference:

// stores/user.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create<State & Actions>()(
persist(
(set) => ({
// state and actions
}),
{ name: 'userStore' }
)
);

Local Component State

For component-specific state:
• Use React’s useState, useReducer within the component
• Or create custom hooks in hooks/ directory

6. API Integration

API Client Functions
• Place in api/ directory
• Each file should represent a domain area (auth.api.ts, profile.api.ts, etc.)
• Abstract API calls from components

Example API structure:

// api/auth.api.ts
import { nexusAxios } from '../configs/axios.config';

export const login = async (credentials) => {
const response = await nexusAxios.post('/auth/login', credentials);
return response.data;
};

Axios Configuration

Your API configuration should be in configs/axios.config.ts:
• Setup base URL, timeouts
• Configure request/response interceptors
• Handle common error cases

7. Custom Hooks

Hook Organization
• Domain-specific hooks go in hooks/ directory
• Global/utility hooks go in hooks/global/
• Name hooks with use prefix (React convention)

Data Fetching Hooks

For data fetching, integrate with React Query:
• Wrap API calls in custom hooks
• Handle loading, error states
• Set up caching and refetching

Example pattern:

// hooks/useAuth.ts
export function useAuth() {
const [user, setUser] = useUserStore((state) => [state.user, state.setUser]);

const login = async (credentials) => {
// call API and update state
};

return { user, login };
}

8. Business Logic

Separation of Concerns
• Components: Presentation and event handling
• Hooks: Reusable logic and state management
• Stores: Global state
• API: Data fetching
• Utils/Helpers: Pure functions, transformations (all date/time helpers via Luxon)

Service Pattern

For complex business logic:
• Create service files in services/ directory (if needed)
• Group related operations together
• Use dependency injection where possible

9. TypeScript Types
   • Place shared types in types/ directory
   • Co-locate component-specific types with components
   • Use descriptive names and follow consistent conventions
   • Export and import types as needed

10. Authorization & Authentication

Authentication Flow 1. Store authentication tokens in Zustand store with persist middleware 2. Use request interceptors to attach tokens to requests 3. Use response interceptors to handle unauthorized responses 4. Implement refresh token logic when tokens expire

Route Protection

Use guard components to protect routes:

// components/guards/authenticated.guard.tsx
'use client';

const AuthenticatedGuard: React.FC<PropsWithChildren> = ({ children }) => {
// Check authentication and redirect if needed
return isAuthenticated ? children : <Redirect to='/login' />;
};

11. Error Handling
    • Implement global error handling in axios interceptors
    • Create custom error handling utilities in utils/errorHandler.ts
    • Use try/catch blocks with custom error messages
    • Display user-friendly error messages using toast notifications

12. Development Workflow

Component Development 1. Define types and interfaces first 2. Build UI components with minimal logic 3. Add business logic and state management 4. Connect to API endpoints 5. Add error handling and edge cases

Page Development 1. Create route in app/ directory 2. Create client component in clients/ directory 3. Add required components and hooks 4. Connect to global state if needed 5. Test with different states and data

13. Performance Considerations
    • Use Next.js Image component for optimized images
    • Lazy load components when possible
    • Implement proper memoization with React.memo, useMemo, useCallback
    • Use skeleton loaders for better UX during loading states

⸻

By enforcing Luxon for all date/time operations and forbidding alternative libraries, your codebase remains consistent and reliable in handling dates and times.
