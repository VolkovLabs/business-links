import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    linksContainer: css`
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
    `,
  };
};
