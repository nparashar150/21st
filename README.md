# 21st Components Monorepo

A scalable monorepo for 21st.dev UI components built with pnpm workspaces.

## Structure

```
21st/
├── packages/          # Component packages
│   ├── ai-writer/
│   ├── query-builder/
│   ├── timeline/
│   ├── api-playground/
│   └── ...            # Add more components here
├── apps/              # Applications
│   └── preview/       # Unified preview site
└── pnpm-workspace.yaml
```

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the preview app:**
   ```bash
   pnpm dev
   ```

   Or from the root:
   ```bash
   cd apps/preview && pnpm dev
   ```

## Adding a New Component

1. **Create a new package:**
   ```bash
   mkdir -p packages/your-component
   cd packages/your-component
   ```

2. **Create `package.json`:**
   ```json
   {
     "name": "@21st/your-component",
     "version": "0.1.0",
     "private": true,
     "type": "module",
     "main": "./index.ts",
     "types": "./index.ts",
     "exports": {
       ".": {
         "import": "./index.ts",
         "types": "./index.ts"
       }
     },
     "peerDependencies": {
       "react": "^19.0.0",
       "react-dom": "^19.0.0"
     }
   }
   ```

3. **Create `index.ts`** that exports your component:
   ```ts
   export { YourComponent } from './component';
   export type { YourComponentProps } from './component';
   ```

4. **Add to preview app:**
   - Add `"@21st/your-component": "workspace:*"` to `apps/preview/package.json`
   - Add path mapping to `apps/preview/tsconfig.json`
   - Add to `transpilePackages` in `apps/preview/next.config.ts`
   - Create demo component in `apps/preview/src/components/preview/`
   - Add tab to `apps/preview/src/app/page.tsx`

## Architecture Benefits

- **Scalable**: Easy to add 100+ components
- **Isolated**: Each component is a separate package
- **Reusable**: Components can be imported in any app
- **Type-safe**: Full TypeScript support across packages
- **Fast**: pnpm workspaces for efficient dependency management
- **Flexible**: Each package can have its own dependencies

## Scripts

- `pnpm dev` - Run preview app
- `pnpm build` - Build preview app
- `pnpm build:all` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages

## Package Naming Convention

All packages follow the `@21st/component-name` naming pattern:
- `@21st/ai-writer`
- `@21st/query-builder`
- `@21st/timeline`
- `@21st/api-playground`

This makes imports clean and consistent:
```ts
import { AIWriter } from '@21st/ai-writer';
import { QueryBuilder } from '@21st/query-builder';
```
