'use client';

import * as React from 'react';
import { GripVertical, Trash2, ChevronDown, Check } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Rule, Field, OperatorType, OPERATORS } from './types';
import { ValueEditor } from './value-editor';
import { getFieldByName, groupFieldsByCategory, getOperatorsForField } from './utils';

interface RuleRowProps {
  rule: Rule;
  fields: Field[];
  onUpdate: (updates: Partial<Rule>) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function RuleRow({ rule, fields, onUpdate, onRemove, disabled }: RuleRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const currentField = getFieldByName(fields, rule.field);
  const operators = getOperatorsForField(currentField);
  const groupedFields = React.useMemo(() => groupFieldsByCategory(fields), [fields]);

  const handleFieldChange = (fieldName: string) => {
    const newField = getFieldByName(fields, fieldName);
    const newOperators = getOperatorsForField(newField);
    const newOperator = newOperators.includes(rule.operator) ? rule.operator : newOperators[0];

    onUpdate({
      field: fieldName,
      operator: newOperator,
      value: newField?.type === 'multiselect' ? [] : null,
      secondValue: null
    });
  };

  const handleOperatorChange = (operator: OperatorType) => {
    onUpdate({
      operator,
      value: currentField?.type === 'multiselect' || ['in', 'notIn'].includes(operator) ? [] : null,
      secondValue: null
    });
  };

  const handleValueChange = (value: string | string[] | null, secondValue?: string | null) => {
    onUpdate({ value, secondValue });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/rule flex items-center gap-2 transition-all duration-200',
        isDragging && 'opacity-90',
        disabled && 'opacity-50 pointer-events-none'
      )}>
      {/* Drag handle - outside the rule box */}
      <button
        {...attributes}
        {...listeners}
        className='text-muted-foreground hover:text-foreground shrink-0 cursor-grab p-0.5 transition-colors active:cursor-grabbing'>
        <GripVertical className='h-4 w-4' />
      </button>

      {/* Rule content box */}
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 rounded-lg border p-2.5',
          'bg-background/80 dark:bg-white/[0.03]',
          'hover:border-primary/30 dark:hover:border-primary/40',
          isDragging && 'shadow-lg border-primary/50'
        )}>
        {/* Field selector */}
        <FieldSelector fields={fields} groupedFields={groupedFields} value={rule.field} onChange={handleFieldChange} disabled={disabled} />

        {/* Operator selector */}
        <OperatorSelector operators={operators} value={rule.operator} onChange={handleOperatorChange} disabled={disabled} />

        {/* Value editor */}
        {currentField && <ValueEditor field={currentField} operator={rule.operator} value={rule.value} secondValue={rule.secondValue} onChange={handleValueChange} disabled={disabled} />}

        {/* Remove button */}
        <Button variant='ghost' size='icon-sm' onClick={onRemove} disabled={disabled} className='text-muted-foreground hover:text-destructive ml-auto h-7 w-7'>
          <Trash2 className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  );
}

// Field Selector Component
function FieldSelector({
  fields,
  groupedFields,
  value,
  onChange,
  disabled
}: {
  fields: Field[];
  groupedFields: Map<string, Field[]>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedField = fields.find((f) => f.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' role='combobox' aria-expanded={open} disabled={disabled} className={cn('h-8 min-w-24 justify-between gap-1 px-2 font-normal', !value && 'text-muted-foreground')}>
          <span className='truncate'>{selectedField?.label ?? 'Field'}</span>
          <ChevronDown className='h-3.5 w-3.5 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-44 p-1' align='start'>
        <div className='max-h-64 overflow-y-auto'>
          {Array.from(groupedFields.entries()).map(([group, groupFields]) => (
            <div key={group}>
              {groupedFields.size > 1 && <div className='text-muted-foreground px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider'>{group}</div>}
              {groupFields.map((field) => (
                <button
                  key={field.name}
                  onClick={() => {
                    onChange(field.name);
                    setOpen(false);
                  }}
                  className={cn('hover:bg-accent flex w-full items-center rounded-sm px-2 py-1.5 text-sm', value === field.name && 'bg-accent')}>
                  <Check className={cn('mr-2 h-3.5 w-3.5', value === field.name ? 'opacity-100' : 'opacity-0')} />
                  {field.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Operator Selector Component
function OperatorSelector({ operators, value, onChange, disabled }: { operators: OperatorType[]; value: OperatorType; onChange: (value: OperatorType) => void; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const selectedOperator = OPERATORS[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' role='combobox' aria-expanded={open} disabled={disabled} className='h-8 min-w-20 justify-between gap-1 px-2 font-normal'>
          <span className='truncate'>{selectedOperator?.label ?? value}</span>
          <ChevronDown className='h-3.5 w-3.5 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-40 p-1' align='start'>
        <div className='max-h-64 overflow-y-auto'>
          {operators.map((op) => {
            const operator = OPERATORS[op];
            return (
              <button
                key={op}
                onClick={() => {
                  onChange(op);
                  setOpen(false);
                }}
                className={cn('hover:bg-accent flex w-full items-center rounded-sm px-2 py-1.5 text-sm', value === op && 'bg-accent')}>
                <Check className={cn('mr-2 h-3.5 w-3.5', value === op ? 'opacity-100' : 'opacity-0')} />
                {operator?.label ?? op}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
