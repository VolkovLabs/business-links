import { Label, useStyles2 } from '@grafana/ui';
import React from 'react';

import { getStyles } from './FieldsGroup.styles';

/**
 * Properties
 */
interface Props {
  /**
   * Label
   */
  label: React.ReactNode | string;

  /**
   * Children
   */
  children: React.ReactNode | React.ReactNode[];

  /**
   * Description
   */
  description?: string;
}

/**
 * Fields Group
 */
export const FieldsGroup: React.FC<Props> = ({ label, children, description }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  return (
    <fieldset className={styles.root}>
      <Label description={description}>{label}</Label>
      {children}
    </fieldset>
  );
};
