import { useStyles2 } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { getStyles } from './LoadingBar.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.loadingBar;

/**
 * Loading Bar
 */
export const LoadingBar: React.FC = () => {
  /**
   * Hooks
   */
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.loadingContainer} {...testIds.root.apply()}>
      <span className={styles.loadingDots}>
        <span className={styles.loadingDot} />
        <span className={styles.loadingDot} />
        <span className={styles.loadingDot} />
      </span>
    </div>
  );
};
