import { FieldSource } from '@/types';

/**
 * Reorder
 * @param list
 * @param startIndex
 * @param endIndex
 */
export const reorder = <T>(list: T[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Get Field Key
 */
export const getFieldKey = (field: FieldSource): string => `${field.source}:${field.name}`;
