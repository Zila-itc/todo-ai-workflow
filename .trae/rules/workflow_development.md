# Workflow & Project Phases

This document outlines the main workflow phases:

- Development
- Testing
- Definition of DONE
- Phase Timeline and Status (Focus on one phase per request for simplified tracking.)

## Development

### 1. Analysis Phase

#### UI Analysis

- **Components Identified**: Header/Title, Form sections, Input fields, Buttons, Layout containers, Special UI elements.
- **Existing Components**: Prioritize global components (e.g., `Select` from `@/components/Input`).
- **Missing Components**: List [Component name] - [Description].

## 2. Implementation Plan

### [Feature Name] Implementation

- **Layout Structure**: Create main page, `PageContainer` wrapper, responsive grid, page title/header, form container.
- **Form Components**: Implement form sections with validated inputs, state setup, labels, placeholders, select dropdowns, and submission handling (using `useForm` hook, loading states, validation).
- **Styling & UX**: Adhere to project design (Tailwind), match UI design (colors, spacing, typography, borders, shadows), ensure responsiveness, implement hover/focus states.
- **Integration**: Connect to API endpoints ([Endpoint 1], [Endpoint 2]), add error handling, success feedback, and form reset.
- **Testing & Validation**: Test form submission, validate rules, check responsive design, ensure ESLint compliance, test error scenarios.

## 3. Quick Task Templates

### For Simple Forms

- Create [FormName] component, add validated fields, implement submission, loading, and error states.

### For Complex UI Sections

- Analyze requirements, break into sub-components, implement layout, add interactive elements, connect data/events, test, and validate.

### For API Integration

- API logic in `app/api/xxx`. Use React Query for state management. Refer to <mcfile name="sample_usagge.md" path="docs/sample_usagge.md"></mcfile> and <mcfile name="openapi.yaml" path="docs/openapi.yaml"></mcfile>.

## 4. Project Structure Analysis

### File Organization Pattern

- Respect global/local components to avoid duplication. Align with Next.js 15 structure:

  ```
  src/hooks
  src/components
  src/app/   # Next.js 15 App Router: all routes/pages/layouts live here
    ├── page.tsx         # Main route: /
    ├── about/
    │   └── page.tsx     # Route: /about
    ├── [feature]/       # Dynamic route: /:feature
    │   └── page.tsx
    ├── layout.tsx       # Shared layout for all routes
    ├── api/
    │   └── hello/route.ts # API route: /api/hello
    └── ...              # Add more folders for more routes
  src/store
  src/utils/   # Utility functions, helpers, shared logic
  src/service
  src/feature-name/
    |-- feature_name.md # Temp plan, moves to any-agent/rules/tasks/feature_name.plan.d on completion
    ├── types.ts           # TypeScript type definitions
    ├── services.ts        # Business logic & API calls (data normalization)
    ├── useFeature.ts      # Custom hook for React logic (handleClick, ref, Zustand connection)
    └── components/
        ├── Component1.tsx
        ├── Component2.tsx
        └── Component3.tsx
  
  # Notes:
  # - Use 'page.tsx' for each route in 'app/'.
  # - Use 'layout.tsx' for shared layouts.
  # - Use '[param]' for dynamic routes.
  # - Use 'route.ts' for API endpoints in 'app/api/'.
  # - Add 'metadata' export in page/layout for SEO.
  ```

## 5. General Development Workflow in summary

### Understand Requirements

- Define feature/bug, review UI/UX, identify APIs/data sources.

### Plan Implementation

- Break down tasks, identify reusable components, plan state management.

### Code Implementation

- Follow patterns, write clean code, add comments, use mock data if APIs are not provided.

    ```ts
    const mockData = { amount: 100, currency: 'USD', total: 200 }
    <div>{mockData.amount}</div>
    ```

### Testing

- Write unit tests, perform manual testing, check responsiveness & cross-browser compatibility.

## 6. Feature-Specific Project Structure

see structure above src/feature-name/

## 7. Definition of DONE

## Start Verify on ## 7. Definition of DONE

Success Criteria Met: by start working implement and verify process step by step must refer to this guide. rules/dev_workflow_guild.md
you need to test from step ### Test to ### status
quick recap you need to verify by action like run terminal scrip or script in package.json

### Test

- Verify `npm run test` passes; fix all errors.

### Build

- Run `npm run build` and `npm run start`; fix build errors, verify production port is running.

### Functionality and UI

- Verify usability for public release via testing reports.

### Status

- Confirm code is up-to-date with project rules, status, and local plans.

## 8. Phase Timeline and Status

### Phase 1: Core Setup

- [ ] Project setup & PWA config, Basic UI, IndexedDB, Zustand stores.

### Phase 2: Audio Engine

- [ ] Audio playback, Queue management, Shuffle/repeat.

### Phase 3: User Features

- [ ] Favorites, Search, Filter systems.

### Phase 4: Polish & Optimization

- [ ] Performance, Testing coverage, Documentation.

### Phase 5: Advanced Features

- [ ] Advanced PWA, Analytics, Deployment optimization.
