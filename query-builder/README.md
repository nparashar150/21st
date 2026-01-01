# Query Builder

A beautiful, fully customizable query builder component for React. Built with Radix UI primitives and styled with Tailwind CSS. No external query builder library dependencies.

## Features

- **Multiple Field Types**: Support for text, number, date, select, multiselect, and boolean fields
- **Smart Operators**: Each field type gets appropriate operators automatically
- **Nested Groups**: Create complex AND/OR queries with nested groups (up to 3 levels deep)
- **Drag & Drop**: Reorder rules and groups with intuitive drag and drop
- **Fully Typed**: Complete TypeScript support with comprehensive types
- **Accessible**: Built with Radix UI primitives following WAI-ARIA guidelines
- **Dark Mode**: Full dark mode support out of the box
- **Customizable**: Built with Tailwind CSS for easy styling

## Installation

```bash
cd query-builder
pnpm install
```

## Development

```bash
pnpm dev
```

## Usage

```tsx
import { QueryBuilder, Field, RuleGroup } from '@/components/query-builder';

const fields: Field[] = [
  { name: 'name', label: 'Name', type: 'text', group: 'User' },
  { name: 'email', label: 'Email', type: 'text', group: 'User' },
  { name: 'age', label: 'Age', type: 'number', group: 'User' },
  { name: 'created_at', label: 'Created At', type: 'date', group: 'User' },
  { name: 'is_active', label: 'Is Active', type: 'boolean', group: 'User' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    group: 'User',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
    ],
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'multiselect',
    group: 'User',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'beta', label: 'Beta Tester' },
    ],
  },
];

function MyComponent() {
  const [query, setQuery] = useState<RuleGroup>();

  return (
    <QueryBuilder
      fields={fields}
      value={query}
      onChange={setQuery}
    />
  );
}
```

## Field Types

| Type | Description | Default Operators |
|------|-------------|-------------------|
| `text` | Text input | equals, notEquals, contains, notContains, startsWith, endsWith, isEmpty, isNotEmpty |
| `number` | Numeric input | equals, notEquals, greaterThan, lessThan, greaterThanOrEquals, lessThanOrEquals, between, isEmpty, isNotEmpty |
| `date` | Date picker | equals, notEquals, before, after, between, inTheLastDays, inTheNextDays, isNull, isNotNull |
| `select` | Single select dropdown | equals, notEquals, isNull, isNotNull |
| `multiselect` | Multi-select with tags | in, notIn, isEmpty, isNotEmpty |
| `boolean` | Yes/No selector | equals, notEquals |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `Field[]` | Required | Array of field configurations |
| `value` | `RuleGroup` | - | Controlled value |
| `defaultValue` | `RuleGroup` | - | Initial value for uncontrolled mode |
| `onChange` | `(value: RuleGroup) => void` | - | Callback when query changes |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `showControls` | `boolean` | `true` | Show header with reset/copy buttons |
| `showValidation` | `boolean` | `true` | Show validation badge |
| `className` | `string` | - | Additional CSS classes |

## Types

```typescript
interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  group?: string;
  operators?: OperatorType[];
  options?: FieldOption[] | 'loading';
  placeholder?: string;
}

interface FieldOption {
  value: string;
  label: string;
}

interface Rule {
  id: string;
  type: 'rule';
  field: string;
  operator: OperatorType;
  value: string | string[] | null;
  secondValue?: string | null;
}

interface RuleGroup {
  id: string;
  type: 'group';
  combinator: 'and' | 'or';
  rules: (Rule | RuleGroup)[];
}
```

## Dependencies

- React 19
- @radix-ui/react-popover
- @radix-ui/react-select
- @radix-ui/react-checkbox
- @radix-ui/react-tooltip
- @dnd-kit/core
- @dnd-kit/sortable
- date-fns
- react-day-picker
- lucide-react
- tailwind-merge
- class-variance-authority

## License

MIT

