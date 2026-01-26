import { generateId } from '../../lib/utils';
import { Rule, RuleGroup, Field, DEFAULT_OPERATORS, OperatorType, OPERATORS, createEmptyRule, createEmptyGroup } from './types';

export function addRule(group: RuleGroup, fields: Field[]): RuleGroup {
  const newRule = createEmptyRule(generateId(), fields[0]);
  return {
    ...group,
    rules: [...group.rules, newRule]
  };
}

export function addGroup(group: RuleGroup): RuleGroup {
  const newGroup = createEmptyGroup(generateId());
  return {
    ...group,
    rules: [...group.rules, newGroup]
  };
}

export function removeItem(group: RuleGroup, itemId: string): RuleGroup {
  return {
    ...group,
    rules: group.rules
      .filter((item) => item.id !== itemId)
      .map((item) => {
        if (item.type === 'group') {
          return removeItem(item, itemId);
        }
        return item;
      })
  };
}

export function updateRule(group: RuleGroup, ruleId: string, updates: Partial<Rule>): RuleGroup {
  return {
    ...group,
    rules: group.rules.map((item) => {
      if (item.id === ruleId && item.type === 'rule') {
        return { ...item, ...updates };
      }
      if (item.type === 'group') {
        return updateRule(item, ruleId, updates);
      }
      return item;
    })
  };
}

export function updateGroupCombinator(group: RuleGroup, groupId: string, combinator: 'and' | 'or'): RuleGroup {
  if (group.id === groupId) {
    return { ...group, combinator };
  }
  return {
    ...group,
    rules: group.rules.map((item) => {
      if (item.type === 'group') {
        return updateGroupCombinator(item, groupId, combinator);
      }
      return item;
    })
  };
}

export function getOperatorsForField(field: Field | undefined): OperatorType[] {
  if (!field) return DEFAULT_OPERATORS.text;
  return field.operators ?? DEFAULT_OPERATORS[field.type] ?? DEFAULT_OPERATORS.text;
}

export function getOperatorLabel(operator: OperatorType): string {
  return OPERATORS[operator]?.label ?? operator;
}

export function operatorRequiresValue(operator: OperatorType): boolean {
  return OPERATORS[operator]?.requiresValue ?? true;
}

export function getOperatorValueCount(operator: OperatorType): 1 | 2 {
  return OPERATORS[operator]?.valueCount ?? 1;
}

export function getFieldByName(fields: Field[], name: string): Field | undefined {
  return fields.find((f) => f.name === name);
}

export function groupFieldsByCategory(fields: Field[]): Map<string, Field[]> {
  const grouped = new Map<string, Field[]>();
  
  fields.forEach((field) => {
    const group = field.group ?? 'General';
    const existing = grouped.get(group) ?? [];
    grouped.set(group, [...existing, field]);
  });
  
  return grouped;
}

export function isValidRule(rule: Rule, fields: Field[]): boolean {
  if (!rule.field) return false;
  
  const field = getFieldByName(fields, rule.field);
  if (!field) return false;
  
  if (!operatorRequiresValue(rule.operator)) return true;
  
  if (rule.value === null || rule.value === '' || (Array.isArray(rule.value) && rule.value.length === 0)) {
    return false;
  }
  
  if (getOperatorValueCount(rule.operator) === 2 && !rule.secondValue) {
    return false;
  }
  
  return true;
}

export function isValidGroup(group: RuleGroup, fields: Field[]): boolean {
  if (group.rules.length === 0) return false;
  
  return group.rules.every((item) => {
    if (item.type === 'rule') {
      return isValidRule(item, fields);
    }
    return isValidGroup(item, fields);
  });
}

export function countRules(group: RuleGroup): number {
  return group.rules.reduce((count, item) => {
    if (item.type === 'rule') return count + 1;
    return count + countRules(item);
  }, 0);
}

