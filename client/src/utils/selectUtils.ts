// client/src/utils/selectUtils.ts
import { SelectItem } from '@shared/types';

export const generateRandomColor = (): string => {
  const colors = [
    '#373530',
    '#787774',
    '#976D57',
    '#CC772F',
    '#C29243',
    '#548064',
    '#477DA5',
    '#A48BBE',
    '#B35588',
    '#C4554D',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const createNewSelectItem = (name: string): SelectItem => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  color: generateRandomColor(),
});

export const parseSelectedValues = (
  value: string | undefined,
  isMultiSelect: boolean
): string[] => {
  if (!value) return [];
  return isMultiSelect
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [value].filter(Boolean);
};
