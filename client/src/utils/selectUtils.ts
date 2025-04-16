// client/src/utils/selectUtils.ts
import { SelectItem } from '@shared/types';

const colors = [
  '#FF8F37', // Orange
  '#FFB347', // Yellow
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#F44336', // Red
];

export function getUnusedColor(usedColors: Set<string> = new Set()): string {
  // First try to find an unused color
  const unusedColor = colors.find((color) => !usedColors.has(color));
  if (unusedColor) return unusedColor;

  // If all colors are used, return a random one
  return colors[Math.floor(Math.random() * colors.length)];
}

export const createNewSelectItem = (name: string, existingItems: SelectItem[] = []): SelectItem => {
  const usedColors = new Set(existingItems.map((item) => item.color));
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    color: getUnusedColor(usedColors),
  };
};

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
