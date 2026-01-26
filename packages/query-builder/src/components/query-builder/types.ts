export type Combinator = 'and' | 'or';

export type OperatorType =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEquals'
  | 'lessThanOrEquals'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'before'
  | 'after'
  | 'inTheLastDays'
  | 'inTheNextDays';

export interface Operator {
  name: OperatorType;
  label: string;
  requiresValue?: boolean;
  valueCount?: 1 | 2; // For between operator
}

export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';

export interface FieldOption {
  value: string;
  label: string;
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  group?: string;
  operators?: OperatorType[];
  options?: FieldOption[] | 'loading';
  placeholder?: string;
}

export interface Rule {
  id: string;
  type: 'rule';
  field: string;
  operator: OperatorType;
  value: string | string[] | null;
  secondValue?: string | null; // For between operator
}

export interface RuleGroup {
  id: string;
  type: 'group';
  combinator: Combinator;
  rules: (Rule | RuleGroup)[];
}

export type QueryBuilderValue = RuleGroup;

// Default operators for each field type
export const DEFAULT_OPERATORS: Record<FieldType, OperatorType[]> = {
  text: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEquals', 'lessThanOrEquals', 'between', 'isEmpty', 'isNotEmpty'],
  select: ['equals', 'notEquals', 'isNull', 'isNotNull'],
  multiselect: ['in', 'notIn', 'isEmpty', 'isNotEmpty'],
  date: ['equals', 'notEquals', 'before', 'after', 'between', 'inTheLastDays', 'inTheNextDays', 'isNull', 'isNotNull'],
  boolean: ['equals', 'notEquals']
};

export const OPERATORS: Record<OperatorType, Operator> = {
  equals: { name: 'equals', label: 'equals', requiresValue: true },
  notEquals: { name: 'notEquals', label: 'does not equal', requiresValue: true },
  contains: { name: 'contains', label: 'contains', requiresValue: true },
  notContains: { name: 'notContains', label: 'does not contain', requiresValue: true },
  startsWith: { name: 'startsWith', label: 'starts with', requiresValue: true },
  endsWith: { name: 'endsWith', label: 'ends with', requiresValue: true },
  isEmpty: { name: 'isEmpty', label: 'is empty', requiresValue: false },
  isNotEmpty: { name: 'isNotEmpty', label: 'is not empty', requiresValue: false },
  greaterThan: { name: 'greaterThan', label: 'is greater than', requiresValue: true },
  lessThan: { name: 'lessThan', label: 'is less than', requiresValue: true },
  greaterThanOrEquals: { name: 'greaterThanOrEquals', label: 'is greater than or equal to', requiresValue: true },
  lessThanOrEquals: { name: 'lessThanOrEquals', label: 'is less than or equal to', requiresValue: true },
  between: { name: 'between', label: 'is between', requiresValue: true, valueCount: 2 },
  in: { name: 'in', label: 'is any of', requiresValue: true },
  notIn: { name: 'notIn', label: 'is none of', requiresValue: true },
  isNull: { name: 'isNull', label: 'is unknown', requiresValue: false },
  isNotNull: { name: 'isNotNull', label: 'is known', requiresValue: false },
  before: { name: 'before', label: 'is before', requiresValue: true },
  after: { name: 'after', label: 'is after', requiresValue: true },
  inTheLastDays: { name: 'inTheLastDays', label: 'in the last', requiresValue: true },
  inTheNextDays: { name: 'inTheNextDays', label: 'in the next', requiresValue: true }
};

export function createEmptyRule(id: string, field?: Field): Rule {
  const defaultOperator = field ? (DEFAULT_OPERATORS[field.type]?.[0] ?? 'equals') : 'equals';
  return {
    id,
    type: 'rule',
    field: field?.name ?? '',
    operator: defaultOperator,
    value: field?.type === 'multiselect' ? [] : null
  };
}

export function createEmptyGroup(id: string, combinator: Combinator = 'and'): RuleGroup {
  return {
    id,
    type: 'group',
    combinator,
    rules: []
  };
}

