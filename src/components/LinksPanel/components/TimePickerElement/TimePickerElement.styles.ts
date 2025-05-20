import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    link: css`
      margin: ${theme.spacing(0.5)};
    `,
    linkGridMode: css`
      width: 100%;
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
    currentTimePicker: css`
      background-color: ${theme.colors.warning.borderTransparent};
      &:hover {
        z-index: ${theme.zIndex.dropdown};
        background: ${theme.colors.background.secondary};
      }
    `,
  };
};
