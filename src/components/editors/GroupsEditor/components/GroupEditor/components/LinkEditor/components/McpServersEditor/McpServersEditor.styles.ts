import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Get Styles
 */
export const getStyles = (theme: GrafanaTheme2) => ({
  item: css({
    marginBottom: theme.spacing(1),
  }),
  itemContent: css({
    padding: theme.spacing(1),
    border: `1px solid ${theme.colors.border.weak}`,
    borderRadius: theme.shape.radius.default,
    backgroundColor: theme.colors.background.secondary,
  }),
  itemHeader: css({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  }),
  itemHeaderForm: css({
    gap: theme.spacing(1),
  }),
  itemHeaderText: css({
    justifyContent: 'space-between',
  }),
  serverInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  }),
  serverActions: css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  }),
  serverName: css({
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.text.primary,
    fontSize: theme.typography.bodySmall.fontSize,
  }),
  serverUrl: css({
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.bodySmall.fontSize,
  }),
  fieldName: css({
    marginBottom: 0,
    minWidth: '150px',
  }),
  fieldUrl: css({
    marginBottom: 0,
    flex: 1,
  }),
  actionButton: css({
    marginLeft: theme.spacing(0.5),
  }),
  dragHandle: css({
    cursor: 'grab',
    marginLeft: theme.spacing(1),
  }),
  dragIcon: css({
    color: theme.colors.text.secondary,
  }),
  serverDetails: css({
    padding: theme.spacing(1),
    gap: theme.spacing(1),
  }),
  newItem: css({
    padding: theme.spacing(1),
    border: `1px solid ${theme.colors.border.weak}`,
    borderRadius: theme.shape.radius.default,
    backgroundColor: theme.colors.background.secondary,
  }),
});
