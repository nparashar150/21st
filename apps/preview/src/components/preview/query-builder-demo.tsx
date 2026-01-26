'use client';

import { useState } from 'react';
import { QueryBuilder, RuleGroup, Field } from '@21st/query-builder';

const DEMO_FIELDS: Field[] = [
  { name: 'name', label: 'Name', type: 'text', group: 'Contact' },
  { name: 'email', label: 'Email', type: 'text', group: 'Contact' },
  { name: 'age', label: 'Age', type: 'number', group: 'Contact' },
  { name: 'signup_date', label: 'Signup Date', type: 'date', group: 'Contact' },
  { name: 'is_active', label: 'Is Active', type: 'boolean', group: 'Contact' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    group: 'Contact',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' }
    ]
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'multiselect',
    group: 'Contact',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'beta', label: 'Beta' },
      { value: 'premium', label: 'Premium' }
    ]
  }
];

export default function QueryBuilderDemo() {
  const [query, setQuery] = useState<RuleGroup | undefined>(undefined);

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-border bg-card p-6'>
        <h2 className='text-xl font-semibold mb-4 text-foreground'>Query Builder</h2>
        <p className='text-sm text-muted-foreground mb-4'>
          Build complex queries with drag-and-drop support, multiple field types, and nested rule groups.
        </p>
        <div className='rounded-lg border border-border bg-background p-4'>
          <QueryBuilder fields={DEMO_FIELDS} query={query} onChange={setQuery} />
        </div>
        {query && (
          <div className='mt-4 p-4 bg-muted rounded-lg'>
            <h3 className='text-sm font-semibold mb-2 text-foreground'>Query JSON:</h3>
            <pre className='text-xs overflow-auto text-muted-foreground'>
              {JSON.stringify(query, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
