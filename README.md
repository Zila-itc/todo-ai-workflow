# Todo List App (DB-less Architecture)

A modern, offline-first Todo List application built with Next.js 15, TypeScript, Tailwind CSS, Zustand, and IndexedDB. Designed for high performance, accessibility, and a beautiful user experience.

## Features

- Add, edit, delete, and complete todo items
- Due dates, reminders, priorities, categories/tags
- Bulk actions and filtering/search
- Responsive UI with custom design system (Tailwind CSS 4)
- Offline support with IndexedDB and PWA
- State management with Zustand
- Form state management and validation (TanStack Form)
- Virtualized lists for large todo sets (TanStack Virtual)
- API endpoints for todos and PWA features
- Accessibility and keyboard navigation
- Testing with Jest and React Testing Library
- Modern DevOps: ESLint, Commitlint, Husky, lint-staged

## Project Structure

```
src/
  app/                # Next.js 15 App Router (all routes/pages/layouts)
    page.tsx          # Main route: /
    [feature]/        # Dynamic route example
    layout.tsx        # Shared layout
    api/              # API endpoints
  components/         # Reusable UI components
  hooks/              # Custom React hooks
  store/              # Zustand stores
  utils/              # Utility functions, helpers
  service/            # Business logic, API calls
  feature-name/       # Feature-specific logic and components
    feature_name.md   # Feature plan
    types.ts
    services.ts
    useFeature.ts
    components/
      Component1.tsx
      ...
public/               # Static assets
```

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**

   ```bash
   npm run build
   npm start
   ```

## Core Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [TanStack Form](https://tanstack.com/form/latest)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## PWA & Offline

- Service worker with [@serwist/next](https://serwist.pages.dev/)
- IndexedDB for local data
- Manifest.json for installability
- Background sync and offline fallback

## Accessibility & UX

- Keyboard navigation
- Screen reader support
- High contrast and theme support
- ARIA labels and roles

## Contributing

1. Fork the repo and create a feature branch
2. Follow commit conventions and run linting/tests before PR
3. Open a pull request with a clear description

## License

MIT

---

For detailed feature status and development workflow, see `.trae/rules/project_feature_status.md` and `.trae/rules/workflow_development.md`.
