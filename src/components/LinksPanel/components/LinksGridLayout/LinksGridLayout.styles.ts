import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    gridLayoutWrapper: css`
      overflow-x: unset;
      overflow-y: auto;
    `,
    linkWrapper: css`
      width: 98%;
      height: 98%;
    `,
    dragIcon: css`
      visibility: hidden;
      position: absolute;
      left: -1px;
      top: -1px;
      background: ${theme.colors.background.primary};
      padding: ${theme.spacing(0, 0.25)};
      border: 1px solid ${theme.colors.border.strong};

      &:hover {
        cursor: move;
        box-shadow: ${theme.colors.primary.border} 0 0 5px;
      }
    `,
    columnItem: css`
      display: flex;
      align-items: center;

      &:hover .react-grid-dragHandleExample {
        visibility: visible;
      }
    `,
    columnItemBorder: css`
      border: 1px solid ${theme.colors.border.weak};

      &:hover {
        box-shadow: ${theme.colors.secondary.border} 0 0 5px;
      }
    `,
  };
};
