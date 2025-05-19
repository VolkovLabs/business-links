import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    linkGridMode: css`
      margin: ${theme.spacing(0.5)};
      overflow: auto;
      width: 200px;
      height: 200px;
      width: 100%;
      height: 100%;
    `,
    contentWrapper: css`
      display: inline-block;
      margin: ${theme.spacing(0.5)};
      overflow: hidden;
      width: 150px;
      height: ${theme.spacing(4)};
      line-height: ${theme.spacing(3.75)};
    `,
  };
};
