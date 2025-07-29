import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    root: css`
      margin-bottom: ${theme.spacing(1)};
    `,
    labelContainer: css`
      display: flex;
      flex-direction: row;
      align-items: center;
    `,
  };
};
