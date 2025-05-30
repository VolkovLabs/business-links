import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2, { dynamicFontSize }: { dynamicFontSize: boolean }) => {
  return {
    link: css`
      margin: ${theme.spacing(0.5)};
    `,
    linkGridMode: css`
      width: 100%;
      ${dynamicFontSize && `font-size: clamp(8px, calc(var(--btn-width) / 10), 14px);`}
    `,
    wrapper: css`
      display: inline-block;
    `,
    currentDashboard: css`
      margin: ${theme.spacing(0.5)};
      background: ${theme.colors.warning.borderTransparent};
    `,
    menu: css`
      background: ${theme.colors.background.secondary};
      padding: ${theme.spacing(0.5)};
    `,
    menuItem: css`
      background: ${theme.colors.background.primary};
      &:hover {
        z-index: ${theme.zIndex.dropdown};
        background: ${theme.colors.background.secondary};
      }
    `,
    currentMenuItem: css`
      background-color: ${theme.colors.warning.borderTransparent};
      &:hover {
        z-index: ${theme.zIndex.dropdown};
        background: ${theme.colors.background.secondary};
      }
    `,
    alignLinkContentLeft: css`
      display: flex;
      justify-content: flex-start;
    `,
    alignLinkContentCenter: css`
      display: flex;
      justify-content: center;
    `,
    alignLinkContentRight: css`
      display: flex;
      justify-content: flex-end;
    `,
  };
};
