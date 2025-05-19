import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    menuLink: css`
      margin: ${theme.spacing(0.5)};
    `,
    highlight: css`
      margin: ${theme.spacing(0.5)};
      background: ${theme.colors.warning.borderTransparent};
    `,
    defaultRow: css`
      display: inline-block;
    `,
    gridRow: css`
      display: flex;
      width: 100%;
    `,
    alignLeft: css`
      justify-content: start;
    `,
    alignRight: css`
      justify-content: end;
    `,
  };
};
