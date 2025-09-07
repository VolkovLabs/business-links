import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2, { dynamicFontSize }: { dynamicFontSize: boolean }) => {
  return {
    annotationItem: css`
      padding: ${theme.spacing(0.5)};
      gap: ${theme.spacing(1)};
      display: flex;
      align-items: center;
      justify-content: space-around;
      ${dynamicFontSize && `font-size: clamp(8px, calc(var(--btn-width) / 10), 14px);`}
    `,
  };
};
