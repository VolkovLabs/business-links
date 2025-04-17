/**
 * Editor Props
 */
export interface EditorProps<TValue> {
  /**
   * Value
   */
  value: TValue;

  /**
   * Change
   */
  onChange: (value: TValue) => void;
}

/**
 * Link Target
 */
export enum LinkTarget {
  NEW_TAB = '_blank',
  SELF_TAB = '_self',
}
