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
      cursor: pointer;
      white-space: nowrap;
      color: ${theme.colors.text.primary};
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      padding: ${theme.spacing(0.5, 1.5)};
      min-height: ${theme.spacing(4)};
      border-radius: ${theme.shape.radius.default};
      margin: 0;
      border: none;
      width: 100%;
      position: relative;
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
    menuItemText: css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    menuItemWrapper: css`
      display: flex;
      flex-direction: row;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: start;
      justify-content: flex-start;
      gap: 8px;
    `,
    customIcon: css`
      width: 1em;
      height: 1em;
      margin-right: ${theme.spacing(0.5)};
      vertical-align: middle;
    `,
  };
};
