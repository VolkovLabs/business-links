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
    linkGridItem: css`
      container-type: inline-size;
      container-name: linkSize;

      margin: ${theme.spacing(0.5)};
      transition: font-size 0.15s ease-in-out;

      span {
        @container linkSize (max-width: 90px) {
          font-size: 8px;
        }

        @container linkSize (min-width: 90px) and (max-width: 130px) {
          font-size: 10px;
        }

        @container linkSize (min-width: 130px) {
          font-size: 14px;
        }
      }
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
