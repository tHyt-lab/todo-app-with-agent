# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Vite and HMR
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run build:github` - Build for GitHub Pages deployment
- `npm run preview` - Preview production build locally

### Code Quality & Linting
- `npm run check` - Run Biome checks (combines lint and format)
- `npm run check:fix` - Run Biome checks and auto-fix issues
- `npm run lint` - Lint code with Biome
- `npm run lint:fix` - Lint and auto-fix issues
- `npm run format` - Format code with Biome
- `npm run format:check` - Check formatting without changes
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run tests in watch mode with Vitest
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Generate test coverage report

### End-to-End Testing
- **Playwright** available for e2e testing (configured but no npm scripts defined)

### CI Pipeline
- `npm run ci` - Run complete CI pipeline (check + type-check + test:run + build)

### Git Hooks
- **husky** - Pre-commit hooks for automated quality checks
- **lint-staged** - Runs CI pipeline on TypeScript files before commit
- Pre-commit automatically runs `npm run ci` when TypeScript files are changed

## Architecture Overview

This is a modern React TypeScript todo application built with:

### Core Stack
- **React 19** with TypeScript
- **Vite** for build tooling and development
- **TanStack Router** for file-based routing
- **Material-UI (MUI)** for component library and theming
- **Jotai** for atomic state management
- **React Hook Form + Zod** for form handling and validation
- **TanStack React Query** for server state management
- **Framer Motion** for animations and transitions

### State Management Architecture
- **Jotai atoms** are defined in `src/store/atoms.ts`
- **Persistent state** using `atomWithStorage` for tasks and app settings
- **Hybrid approach**: TanStack Query for optimistic updates + Jotai for local persistence
- **Complex filtering logic** in `filteredTasksAtom` handles search, status, priority, tags, and date ranges
- **Bidirectional atoms** for theme/language with getter/setter pattern
- **Derived atoms** for filtered/sorted data and theme/language management

### Type Safety & Validation
- **Zod schemas** define data validation and TypeScript types
- **Schema inheritance** with `CreateTaskSchema` omitting auto-generated fields
- **Type inference** using `z.infer<typeof Schema>` for consistency
- **Runtime validation** integrated with React Hook Form

### Routing Structure
- **File-based routing** with TanStack Router
- **Route tree** auto-generated in `src/routeTree.gen.ts`
- **Root layout** in `src/routes/__root.tsx` with providers
- **Task routes** organized under `src/routes/tasks/`
- **Provider hierarchy**: QueryClient > ThemeProvider > LocalizationProvider > AppLayout

### Component Organization
- **Feature-based structure** under `src/features/`
- **Tasks/** - Task management components (List, Form, Detail, Card, Filters)
- **Layout/** - Application layout components with version display
- **Dashboard/** - Dashboard-specific components
- **Settings/** - Theme and language management
- **Shared/** - Reusable utilities and components
- **Custom hooks** in feature-specific `hooks/` directories for reusable logic
- **Utility functions** in `src/shared/utils/` with comprehensive test coverage

### Performance Optimization Patterns
- **React.memo** extensively used for component memoization
- **useCallback** for event handlers to prevent unnecessary re-renders
- **Derived atoms** minimize re-computations in state management
- **AnimatePresence** with Framer Motion for smooth list transitions

### Custom Hook Pattern (useTasks)
- **TanStack Query mutations** for optimistic updates
- **Jotai atom integration** for local state persistence
- **Comprehensive CRUD operations** with loading states
- **Query invalidation** for cache consistency
- **Helper functions** for common task operations (getTaskById, getOverdueTasks, etc.)

### Internationalization
- **i18next** with React integration
- **Locales** in `src/locales/` (Japanese and English)
- **Date localization** with date-fns adapters
- **Utility functions** handle locale-specific formatting (formatDate, formatTaskCount)

### Testing Setup
- **Vitest** for unit testing with jsdom environment
- **Testing Library** for React component testing
- **Test setup** in `src/test/setup.ts`
- **Fake timers** and mocking patterns for date-dependent tests
- **Coverage** configured to exclude test files and generated code
- **Comprehensive utility testing** with edge cases and error scenarios

### Code Quality Tools
- **Biome** for linting and formatting (configured in `biome.json`)
- **TypeScript** with strict configuration
- **Custom Biome rules** for React hooks and TypeScript-specific checks
- **Auto-import organization** enabled

### Build Configuration
- **Base path** dynamically set for GitHub Pages deployment (`/todo-app-with-agent/`)
- **Version injection** - package.json version automatically injected as `__APP_VERSION__` global variable
- **Test coverage** with v8 provider and multiple output formats
- **Auto-generated route tree** excluded from linting

## Environment Requirements
- **Node.js** >= 20.0.0
- **npm** >= 10.0.0

## Deployment
- **Live Demo**: https://thyt-lab.github.io/todo-app-with-agent/
- **GitHub Pages** deployment via GitHub Actions on release
- **Base path** configured for `/todo-app-with-agent/` in production builds
- **Version display** - Application version automatically displayed in header
- **Automated workflow** - Release triggers: version update → build → deploy sequence

## Development Workflow
1. Use `npm run dev` to start development
2. Run `npm run check:fix` to fix code quality issues
3. Use `npm run test` for testing during development
4. Run `npm run ci` before committing to ensure all checks pass
5. **Automated pre-commit checks** - husky automatically runs CI on TypeScript file changes
6. **Version management** - Release creation automatically updates version and deploys

## Key Architectural Patterns

### Atom Composition Pattern
```typescript
// Primitive atoms
export const tasksAtom = atomWithStorage<Task[]>("todo-app-tasks", []);

// Derived atoms with complex logic
export const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filters = get(taskFiltersAtom);
  // Complex filtering and sorting logic
});

// Bidirectional atoms
export const themeAtom = atom(
  (get) => get(appSettingsAtom).theme,
  (get, set, newTheme: Theme) => {
    // Update nested state immutably
  }
);
```

### Query + Atom Hybrid Pattern
```typescript
// TanStack Query for optimistic updates
const createTaskMutation = useMutation({
  mutationFn: async (newTask: CreateTask) => {
    // Immediate local state update
    setTasks(updatedTasks);
    return task;
  },
  onSuccess: () => {
    // Invalidate queries for consistency
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  }
});
```

### Component Performance Pattern
```typescript
export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({ task, index, onMenuOpen }) => {
    const handleMenuOpen = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        onMenuOpen(event, task);
      },
      [onMenuOpen, task],
    );
    // Component logic
  }
);
```

### Version Display Pattern
```typescript
// vite.config.ts - Version injection
import { readFileSync } from "fs";
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});

// Component usage
<Typography variant="body2">
  v{__APP_VERSION__}
</Typography>
```

### GitHub Actions Workflow Pattern
```yaml
# deploy.yml - Integrated version update and deployment
jobs:
  build:
    steps:
      - name: Extract version from tag
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          echo "version=$VERSION" >> $GITHUB_OUTPUT
        if: github.event_name == 'release'
      
      - name: Update package.json version
        run: |
          npm version ${{ steps.version.outputs.version }} --no-git-tag-version
          git add package.json && git commit -m "chore: update version"
          git push origin HEAD:main
        if: github.event_name == 'release'
      
      - name: Build project
        run: npm run build # Uses updated version
```

## Pre-commit Quality Assurance
- **Automatic checks** run on every commit affecting TypeScript files
- **CI pipeline** ensures code quality, type safety, tests, and successful build
- **Prevents broken commits** from entering the repository
- **Consistent code style** enforced through Biome formatting