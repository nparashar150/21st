'use client';

import * as React from 'react';
import { Plus, Trash2, Layers, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn, generateId } from '../../lib/utils';
import { Button } from '../ui/button';
import { RuleGroup as RuleGroupType, Rule, Field, Combinator, createEmptyRule, createEmptyGroup } from './types';
import { RuleRow } from './rule-row';

interface RuleGroupProps {
  group: RuleGroupType;
  fields: Field[];
  onChange: (group: RuleGroupType) => void;
  onRemove?: () => void;
  isRoot?: boolean;
  depth?: number;
  disabled?: boolean;
}

export function RuleGroupComponent({ group, fields, onChange, onRemove, isRoot = false, depth = 0, disabled }: RuleGroupProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
    disabled: isRoot
  });

  const style = !isRoot
    ? {
        transform: CSS.Transform.toString(transform),
        transition
      }
    : undefined;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = group.rules.findIndex((item) => item.id === active.id);
      const newIndex = group.rules.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onChange({
          ...group,
          rules: arrayMove(group.rules, oldIndex, newIndex)
        });
      }
    }
  };

  const handleCombinatorChange = (combinator: Combinator) => {
    onChange({ ...group, combinator });
  };

  const handleAddRule = () => {
    const newRule = createEmptyRule(generateId(), fields[0]);
    onChange({
      ...group,
      rules: [...group.rules, newRule]
    });
  };

  const handleAddGroup = () => {
    const newGroup = createEmptyGroup(generateId());
    // Add a default rule to the new group
    newGroup.rules.push(createEmptyRule(generateId(), fields[0]));
    onChange({
      ...group,
      rules: [...group.rules, newGroup]
    });
  };

  const handleRuleUpdate = (ruleId: string, updates: Partial<Rule>) => {
    onChange({
      ...group,
      rules: group.rules.map((item) => {
        if (item.id === ruleId && item.type === 'rule') {
          return { ...item, ...updates };
        }
        return item;
      })
    });
  };

  const handleRuleRemove = (ruleId: string) => {
    onChange({
      ...group,
      rules: group.rules.filter((item) => item.id !== ruleId)
    });
  };

  const handleNestedGroupChange = (groupId: string, newGroup: RuleGroupType) => {
    onChange({
      ...group,
      rules: group.rules.map((item) => {
        if (item.id === groupId && item.type === 'group') {
          return newGroup;
        }
        return item;
      })
    });
  };

  // Content of the group
  const groupContent = (
    <div
      className={cn(
        'flex-1 rounded-lg border transition-all duration-200',
        isRoot ? 'border-border bg-card/50' : 'border-primary/30 bg-primary/10 dark:border-primary/20 dark:bg-primary/5',
        isDragging && 'shadow-lg border-primary/50',
        disabled && 'opacity-50 pointer-events-none'
      )}>
      {/* Group Header */}
      <div className='flex items-center gap-2 p-3'>
        {/* Combinator Toggle - cleaner segmented style */}
        <div className='border-input inline-flex h-7 items-center overflow-hidden rounded-md border text-xs'>
          <button
            onClick={() => handleCombinatorChange('and')}
            disabled={disabled}
            className={cn(
              'h-full px-2.5 font-medium transition-colors',
              group.combinator === 'and' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            )}>
            AND
          </button>
          <div className='bg-border h-full w-px' />
          <button
            onClick={() => handleCombinatorChange('or')}
            disabled={disabled}
            className={cn(
              'h-full px-2.5 font-medium transition-colors',
              group.combinator === 'or' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            )}>
            OR
          </button>
        </div>

        <span className='text-muted-foreground text-[11px]'>
          {group.combinator === 'and' ? 'all match' : 'any match'}
        </span>

        {!isRoot && onRemove && (
          <Button variant='ghost' size='icon-sm' onClick={onRemove} disabled={disabled} className='text-muted-foreground hover:text-destructive ml-auto h-6 w-6'>
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>

      {/* Rules */}
      <div className='space-y-2 p-3 pt-0'>
        {group.rules.length === 0 ? (
          <div className='border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
            <p className='text-muted-foreground mb-3 text-sm'>No conditions added yet</p>
            <Button variant='outline' size='sm' onClick={handleAddRule} disabled={disabled}>
              <Plus className='mr-1.5 h-3.5 w-3.5' />
              Add condition
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={group.rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className='space-y-2'>
                {group.rules.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && (
                      <div className='flex items-center gap-2 py-1'>
                        <div className='bg-border h-px flex-1' />
                        <span className={cn('text-[10px] font-semibold uppercase tracking-wider', group.combinator === 'and' ? 'text-primary' : 'text-amber-600 dark:text-amber-400')}>
                          {group.combinator}
                        </span>
                        <div className='bg-border h-px flex-1' />
                      </div>
                    )}
                    {item.type === 'rule' ? (
                      <RuleRow rule={item} fields={fields} onUpdate={(updates) => handleRuleUpdate(item.id, updates)} onRemove={() => handleRuleRemove(item.id)} disabled={disabled} />
                    ) : (
                      <RuleGroupComponent
                        group={item}
                        fields={fields}
                        onChange={(newGroup) => handleNestedGroupChange(item.id, newGroup)}
                        onRemove={() => handleRuleRemove(item.id)}
                        depth={depth + 1}
                        disabled={disabled}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add buttons */}
        {group.rules.length > 0 && (
          <div className='flex items-center gap-2 pt-2'>
            <Button variant='outline' size='sm' onClick={handleAddRule} disabled={disabled} className='h-8'>
              <Plus className='mr-1.5 h-3.5 w-3.5' />
              Add condition
            </Button>
            <Button variant='outline' size='sm' onClick={handleAddGroup} disabled={disabled} className='h-8'>
              <Layers className='mr-1.5 h-3.5 w-3.5' />
              Add group
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // For non-root groups, wrap with drag handle outside
  if (!isRoot) {
    return (
      <div ref={setNodeRef} style={style} className={cn('flex items-start gap-2', isDragging && 'opacity-90')}>
        {/* Drag handle - outside the group box */}
        <button
          {...attributes}
          {...listeners}
          className='text-muted-foreground hover:text-foreground mt-3 shrink-0 cursor-grab p-0.5 transition-colors active:cursor-grabbing'>
          <GripVertical className='h-4 w-4' />
        </button>
        {groupContent}
      </div>
    );
  }

  return groupContent;
}
