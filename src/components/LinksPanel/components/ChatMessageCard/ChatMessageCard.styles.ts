import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    messageRow: css`
      display: flex;
    `,
    messageRowUser: css`
      justify-content: flex-end;
    `,
    messageRowAssistant: css`
      justify-content: flex-start;
    `,
    messageContent: css`
      max-width: 70%;
      padding: ${theme.spacing(1.5, 2)};
      border-radius: ${theme.shape.radius.default};
      box-shadow: ${theme.shadows.z1};
      word-break: break-word;
    `,
    messageContentUser: css`
      background: ${theme.colors.primary.main};
      color: ${theme.colors.primary.contrastText};
    `,
    messageContentAssistant: css`
      background: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
    `,
    messageContentSystem: css`
      background: ${theme.colors.error.main};
      color: ${theme.colors.error.contrastText};
      border-left: 4px solid ${theme.colors.error.border};
    `,
    messageContentError: css`
      background: ${theme.colors.error.main};
      color: ${theme.colors.error.contrastText};
      border-left: 4px solid ${theme.colors.error.border};
      font-weight: ${theme.typography.fontWeightMedium};
    `,
    messageContentTool: css`
      background: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
    `,
    messageSender: css`
      font-size: ${theme.typography.bodySmall.fontSize};
      opacity: 0.7;
      margin-bottom: ${theme.spacing(0.5)};
      text-transform: capitalize;
    `,
    messageTextWrap: css`
      width: 100%;
    `,
    messageText: css`
      padding-left: ${theme.spacing(2)};

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: ${theme.spacing(1)};
        margin-bottom: ${theme.spacing(1)};
        font-size: ${theme.typography.bodySmall.fontSize};
      }

      th {
        background: ${theme.colors.background.elevated};
        color: ${theme.colors.text.primary};
        text-align: left;
        padding: ${theme.spacing(1)};
        border: 1px solid ${theme.colors.border.weak};
        font-weight: ${theme.typography.fontWeightBold};
      }

      td {
        padding: ${theme.spacing(1)};
        border: 1px solid ${theme.colors.border.weak};
      }

      tr:nth-of-type(even) {
        background: ${theme.colors.border.medium};
      }

      tr:hover {
        background: ${theme.colors.background.canvas};
      }
    `,
    loadingMessage: css`
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: ${theme.spacing(1)};
    `,
    attachmentsContainer: css`
      margin-top: ${theme.spacing(1)};
      border-top: 1px solid ${theme.colors.border.weak};
      padding-top: ${theme.spacing(1)};
    `,
    attachmentImage: css`
      max-width: 100px;
      max-height: 100px;
      border-radius: ${theme.shape.radius.default};
      margin-top: ${theme.spacing(0.5)};
    `,
    attachedFilesList: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${theme.spacing(1)};
    `,
    fileDetails: css`
      display: flex;
      align-items: center;
      gap: ${theme.spacing(1)};
      flex: 1;
    `,
    fileTypeIcon: css`
      border-radius: ${theme.shape.radius.default};
      padding: ${theme.spacing(0.5)};
      display: flex;
      align-items: center;
      justify-content: center;
    `,
    fileName: css`
      font-size: ${theme.typography.bodySmall.fontSize};
      font-weight: ${theme.typography.fontWeightMedium};
    `,
    fileSize: css`
      font-size: ${theme.typography.bodySmall.fontSize};
      opacity: 0.7;
    `,
    fileThumbnail: css`
      width: 28px;
      height: 28px;
      border-radius: ${theme.shape.radius.default};
      object-fit: cover;
      border: 1px solid ${theme.colors.border.weak};
    `,
  };
};
