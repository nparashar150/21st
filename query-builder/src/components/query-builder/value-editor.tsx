'use client';

import * as React from 'react';
import { X, Check, ChevronDown, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Field, FieldOption, OperatorType } from './types';
import { getOperatorValueCount } from './utils';

interface ValueEditorProps {
  field: Field;
  operator: OperatorType;
  value: string | string[] | null;
  secondValue?: string | null;
  onChange: (value: string | string[] | null, secondValue?: string | null) => void;
  disabled?: boolean;
}

export function ValueEditor({ field, operator, value, secondValue, onChange, disabled }: ValueEditorProps) {
  const valueCount = getOperatorValueCount(operator);

  // Special operators that don't need values
  if (['isEmpty', 'isNotEmpty', 'isNull', 'isNotNull'].includes(operator)) {
    return null;
  }

  // For "in the last/next X days" operators
  if (['inTheLastDays', 'inTheNextDays'].includes(operator)) {
    return (
      <div className='flex items-center gap-1.5'>
        <Input
          type='number'
          min={1}
          placeholder='0'
          value={value?.toString() ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className='h-8 w-20'
        />
        <span className='text-muted-foreground text-xs'>days</span>
      </div>
    );
  }

  // Between operator (two values)
  if (valueCount === 2) {
    if (field.type === 'date') {
      return (
        <div className='flex items-center gap-1.5'>
          <DatePicker value={value?.toString() ?? null} onChange={(v) => onChange(v, secondValue)} disabled={disabled} />
          <span className='text-muted-foreground text-xs'>to</span>
          <DatePicker value={secondValue ?? null} onChange={(v) => onChange(value, v)} disabled={disabled} />
        </div>
      );
    }
    return (
      <div className='flex items-center gap-1.5'>
        <Input
          type={field.type === 'number' ? 'number' : 'text'}
          placeholder='Min'
          value={value?.toString() ?? ''}
          onChange={(e) => onChange(e.target.value, secondValue)}
          disabled={disabled}
          className='h-8 w-24'
        />
        <span className='text-muted-foreground text-xs'>to</span>
        <Input
          type={field.type === 'number' ? 'number' : 'text'}
          placeholder='Max'
          value={secondValue ?? ''}
          onChange={(e) => onChange(value, e.target.value)}
          disabled={disabled}
          className='h-8 w-24'
        />
      </div>
    );
  }

  // Date field
  if (field.type === 'date') {
    return <DatePicker value={value?.toString() ?? null} onChange={(v) => onChange(v)} disabled={disabled} />;
  }

  // Select field
  if (field.type === 'select') {
    return <SingleSelect field={field} value={value?.toString() ?? null} onChange={onChange} disabled={disabled} />;
  }

  // Multiselect field
  if (field.type === 'multiselect' || ['in', 'notIn'].includes(operator)) {
    return <MultiSelect field={field} value={Array.isArray(value) ? value : value ? [value] : []} onChange={onChange} disabled={disabled} />;
  }

  // Boolean field - use switch
  if (field.type === 'boolean') {
    return <BooleanSwitch value={value?.toString() ?? null} onChange={onChange} disabled={disabled} />;
  }

  // Number field
  if (field.type === 'number') {
    return (
      <Input
        type='number'
        placeholder={field.placeholder ?? '0'}
        value={value?.toString() ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className='h-8 w-36'
      />
    );
  }

  // Text field - consistent width
  return (
    <Input
      type='text'
      placeholder={field.placeholder ?? 'Enter value...'}
      value={value?.toString() ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className='h-8 w-36'
    />
  );
}

// Date Picker Component
function DatePicker({ value, onChange, disabled }: { value: string | null; onChange: (value: string | null) => void; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' disabled={disabled} className={cn('h-8 w-36 justify-start gap-2 px-2.5 text-left font-normal', !date && 'text-muted-foreground')}>
          <CalendarIcon className='h-3.5 w-3.5' />
          {date ? format(date, 'MMM d, yyyy') : 'Pick date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(d) => {
            onChange(d ? d.toISOString().split('T')[0] : null);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// Single Select Component
function SingleSelect({ field, value, onChange, disabled }: { field: Field; value: string | null; onChange: (value: string | null) => void; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const isLoading = field.options === 'loading';
  const options: FieldOption[] = isLoading || !field.options || typeof field.options === 'string' ? [] : field.options;
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' role='combobox' aria-expanded={open} disabled={disabled || isLoading} className={cn('h-8 w-36 justify-between gap-1 px-2.5 font-normal', !value && 'text-muted-foreground')}>
          {isLoading ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            <>
              <span className='truncate'>{selectedOption?.label ?? 'Select...'}</span>
              <ChevronDown className='h-3.5 w-3.5 shrink-0 opacity-50' />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-36 p-1' align='start'>
        <div className='max-h-48 overflow-y-auto'>
          {options.length === 0 ? (
            <p className='text-muted-foreground p-2 text-center text-xs'>No options</p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn('hover:bg-accent flex w-full items-center rounded-sm px-2 py-1.5 text-sm', value === option.value && 'bg-accent')}>
                <Check className={cn('mr-2 h-3.5 w-3.5', value === option.value ? 'opacity-100' : 'opacity-0')} />
                {option.label}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Multi Select Component
function MultiSelect({ field, value, onChange, disabled }: { field: Field; value: string[]; onChange: (value: string[]) => void; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const isLoading = field.options === 'loading';
  const options: FieldOption[] = isLoading || !field.options || typeof field.options === 'string' ? [] : field.options;

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className='flex items-center gap-1'>
      {value.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {value.map((v) => {
            const option = options.find((o) => o.value === v);
            return (
              <Badge key={v} variant='secondary' className='h-6 gap-0.5 pr-0.5 text-xs'>
                {option?.label ?? v}
                <button onClick={() => handleRemove(v)} className='hover:bg-muted rounded p-0.5' disabled={disabled}>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' disabled={disabled || isLoading} className='h-8 w-8 p-0'>
            {isLoading ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <ChevronDown className='h-3.5 w-3.5' />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-32 p-1' align='start'>
          <div className='max-h-48 overflow-y-auto'>
            {options.length === 0 ? (
              <p className='text-muted-foreground p-2 text-center text-xs'>No options</p>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn('hover:bg-accent flex w-full items-center rounded-sm px-2 py-1.5 text-sm', value.includes(option.value) && 'bg-accent')}>
                  <Check className={cn('mr-2 h-3.5 w-3.5', value.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
                  {option.label}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Boolean Switch Component
function BooleanSwitch({ value, onChange, disabled }: { value: string | null; onChange: (value: string | null) => void; disabled?: boolean }) {
  const isChecked = value === 'true';

  return (
    <div className='flex items-center gap-2'>
      <Switch checked={isChecked} onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')} disabled={disabled} />
      <span className='text-muted-foreground text-xs'>{isChecked ? 'Yes' : 'No'}</span>
    </div>
  );
}
