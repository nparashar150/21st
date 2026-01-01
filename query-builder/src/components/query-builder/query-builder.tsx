'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';

import { cn, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RuleGroup, Field, createEmptyGroup } from './types';
import { RuleGroupComponent } from './rule-group';
import { countRules, isValidGroup } from './utils';

interface QueryBuilderProps {
  value?: RuleGroup;
  defaultValue?: RuleGroup;
  onChange?: (value: RuleGroup) => void;
  fields: Field[];
  disabled?: boolean;
  showHeader?: boolean;
  className?: string;
}

const DEFAULT_VALUE: RuleGroup = createEmptyGroup(generateId());

export function QueryBuilder({ value, defaultValue, onChange, fields, disabled = false, showHeader = true, className }: QueryBuilderProps) {
  const [internalValue, setInternalValue] = React.useState<RuleGroup>(() => {
    return value ?? defaultValue ?? { ...DEFAULT_VALUE, id: generateId() };
  });

  // Use controlled or uncontrolled value
  const currentValue = value ?? internalValue;
  const isValid = isValidGroup(currentValue, fields);
  const ruleCount = countRules(currentValue);

  const handleChange = React.useCallback(
    (newValue: RuleGroup) => {
      if (!value) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [value, onChange]
  );

  const handleReset = () => {
    const newValue = { ...DEFAULT_VALUE, id: generateId() };
    handleChange(newValue);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      {showHeader && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-medium'>Conditions</h3>
            {ruleCount > 0 && (
              <Badge variant='secondary' className='text-xs'>
                {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
              </Badge>
            )}
            {ruleCount > 0 && (
              <Badge variant={isValid ? 'success' : 'warning'} className='text-xs'>
                {isValid ? 'Valid' : 'Incomplete'}
              </Badge>
            )}
          </div>
          {ruleCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='sm' onClick={handleReset} disabled={disabled} className='h-7 text-xs'>
                  <RotateCcw className='mr-1.5 h-3 w-3' />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear all conditions</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      {/* Query Builder */}
      <RuleGroupComponent group={currentValue} fields={fields} onChange={handleChange} isRoot disabled={disabled} />
    </div>
  );
}

export { createEmptyGroup, createEmptyRule } from './types';
export type { RuleGroup, Rule, Field, FieldOption, Combinator, OperatorType } from './types';
