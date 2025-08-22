import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    `,
    messagesContainer: css`
      flex: 1;
      overflow-y: auto;
      padding: ${theme.spacing(2)};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing(1.5)};
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 90px;
      padding-bottom: ${theme.spacing(2.5)};
    `,
    emptyState: css`
      text-align: center;
      color: ${theme.colors.text.secondary};
      margin-top: ${theme.spacing(2.5)};
    `,
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
    messageText: css`
      white-space: pre-wrap;
    `,
    pulsingDot: css`
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-left: ${theme.spacing(0.5)};
      background-color: currentColor;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.3;
        }
      }
    `,
    loadingMessage: css`
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: ${theme.spacing(1)};
    `,
    loadingContainer: css`
      margin-top: ${theme.spacing(1)};
      display: flex;
      align-items: center;
    `,

    loadingDots: css`
      display: inline-flex;
      align-items: center;
      gap: ${theme.spacing(0.25)};
    `,
    loadingDot: css`
      width: 6px;
      height: 6px;
      background-color: currentColor;
      border-radius: 50%;
      animation: loadingDot 1.4s ease-in-out infinite both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }

      &:nth-child(3) {
        animation-delay: 0s;
      }

      @keyframes loadingDot {
        0%,
        80%,
        100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
    attachmentsContainer: css`
      margin-top: ${theme.spacing(1)};
      border-top: 1px solid ${theme.colors.border.weak};
      padding-top: ${theme.spacing(1)};
    `,
    attachmentItem: css`
      display: flex;
      align-items: center;
      gap: ${theme.spacing(1)};
      font-size: ${theme.typography.bodySmall.fontSize};
      opacity: 0.8;
      margin-bottom: ${theme.spacing(0.5)};
    `,
    attachmentImage: css`
      max-width: 100px;
      max-height: 100px;
      border-radius: ${theme.shape.radius.default};
      margin-top: ${theme.spacing(0.5)};
    `,
    inputPanel: css`
      padding: ${theme.spacing(2)};
      border-radius: 10px;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: ${theme.colors.background.canvas};
      z-index: 1;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    `,
    attachedFilesPreview: css`
      margin-bottom: ${theme.spacing(1.5)};
      padding: ${theme.spacing(1.25)};
      background-color: rgba(${theme.colors.primary.main}11, 0.15);
      border-radius: ${theme.shape.radius.default};
      border: 1px solid ${theme.colors.primary.border};
    `,
    attachedFilesTitle: css`
      font-size: ${theme.typography.bodySmall.fontSize}
      margin-bottom: ${theme.spacing(1)};
      font-weight: ${theme.typography.fontWeightMedium};
      color: ${theme.colors.text.primary};
    `,
    attachedFilesList: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${theme.spacing(1)};
    `,
    fileItem: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${theme.spacing(1, 1.5)};
      background-color: ${theme.colors.background.secondary};
      border-radius: ${theme.shape.radius.default};
      border: 1px solid ${theme.colors.border.medium};
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      width: fit-content;
      max-width: 100%;
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
    removeButton: css`
      margin-left: ${theme.spacing(1)};
    `,
    inputArea: css`
      position: relative;
      border-radius: ${theme.shape.radius.default};
      border: 2px solid ${theme.colors.border.medium};
      background-color: ${theme.colors.background.secondary};
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;

      &:focus-within {
        border-color: ${theme.colors.primary.text};
        box-shadow:
          0 0 0 1px ${theme.colors.primary.main},
          0 3px 8px rgba(0, 0, 0, 0.1);
      }

      &.dragOver {
        border-color: ${theme.colors.primary.main};
        background-color: ${theme.colors.primary.transparent};
        box-shadow:
          0 0 0 2px ${theme.colors.primary.main},
          0 4px 12px rgba(0, 0, 0, 0.15);
      }

      & > div[data-testid='dropzone'] {
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
      }
    `,
    dragOver: css`
      border-color: ${theme.colors.primary.main} !important;
      background-color: ${theme.colors.primary.transparent} !important;
      box-shadow:
        0 0 0 2px ${theme.colors.primary.main},
        0 4px 12px rgba(0, 0, 0, 0.15) !important;
    `,
    textareaContainer: css`
      position: relative;
      padding: ${theme.spacing(1.75, 11.5, 1.75, 1.75)};
    `,
    textarea: css`
      width: 100%;
      min-height: 40px;
      max-height: 180px;
      resize: none;
      border: none;
      padding: 0;
      font-size: ${theme.typography.body.fontSize};
      font-family: inherit;
      background-color: transparent;
      color: ${theme.colors.text.primary};
      outline: none;

      &::placeholder {
        color: ${theme.colors.text.secondary};
      }

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: ${theme.colors.background.primary};
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: ${theme.isDark ? 'rgba(204, 204, 220, 0.2)' : 'rgba(111, 112, 125, 0.5)'};
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: ${theme.isDark ? 'rgba(204, 204, 220, 0.3)' : 'rgba(111, 112, 125, 0.8)'};
      }

      &:focus {
        outline: none;
        box-shadow: none;
      }
    `,
    buttonsContainer: css`
      position: absolute;
      right: ${theme.spacing(1)};
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: ${theme.spacing(1)};
      align-items: center;
    `,
    attachButton: css`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background-color: ${theme.colors.background.primary};
      border: 1px solid ${theme.colors.border.medium};
      border-radius: ${theme.shape.radius.default};
      cursor: pointer;
      transition:
        background-color 0.2s,
        transform 0.1s,
        color 0.2s;
      color: ${theme.colors.text.primary};
      gap: unset;

      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.main};
        color: ${theme.colors.primary.contrastText};
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      font-size: 0;
      svg {
        font-size: 16px;
        margin: 0;
      }
    `,
    sendButton: css`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background-color: ${theme.colors.primary.main};
      border: 1px solid ${theme.colors.primary.border};
      border-radius: ${theme.shape.radius.default};
      cursor: pointer;
      transition:
        background-color 0.2s,
        transform 0.1s;
      color: ${theme.colors.primary.contrastText};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.shade};
      }

      &:active:not(:disabled) {
        transform: scale(0.95);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        background-color: ${theme.colors.background.primary};
        color: ${theme.colors.text.primary};
      }
    `,
    loadingSpinner: css`
      animation: spin 1s linear infinite;

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
    hintsBar: css`
      font-size: ${theme.typography.bodySmall.fontSize};
      color: ${theme.colors.text.secondary};
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid ${theme.colors.border.weak};
      padding: ${theme.spacing(1, 1.75)};
      background-color: rgba(${theme.colors.background.primary}, 0.7);
    `,
    hintIcon: css`
      color: ${theme.colors.primary.text};
    `,
    countersBadges: css`
      display: flex;
      gap: ${theme.spacing(1)};
      align-items: center;
    `,
    filesBadge: css`
      background-color: ${theme.colors.primary.main};
      padding: ${theme.spacing(0.25, 0.75)};
      border-radius: ${theme.shape.radius.default};
      font-size: 10px;
      font-weight: ${theme.typography.fontWeightMedium};
      color: ${theme.colors.primary.contrastText};
    `,
    charsBadge: css`
      background-color: ${theme.colors.background.secondary};
      padding: ${theme.spacing(0.25, 0.75)};
      border-radius: ${theme.shape.radius.default};
      font-size: 10px;
    `,
    fileDropzoneContainer: css`
      margin-bottom: ${theme.spacing(1.5)};
      padding: ${theme.spacing(1.25)};
      background-color: rgba(${theme.colors.primary.main}11, 0.15);
      border-radius: ${theme.shape.radius.default};
      border: 1px solid ${theme.colors.primary.border};
    `,
    dropzoneContent: css`
      text-align: center;
      padding: ${theme.spacing(2)};

      h6 {
        margin: ${theme.spacing(1, 0, 0.5, 0)};
        font-size: ${theme.typography.h6.fontSize};
        font-weight: ${theme.typography.h6.fontWeight};
        color: ${theme.colors.text.primary};
      }

      small {
        color: ${theme.colors.text.secondary};
        font-size: ${theme.typography.bodySmall.fontSize};
      }
    `,
    fileDropzoneOverlay: css`
      background: rgba(255, 255, 255, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: inherit;
      pointer-events: all;
    `,
    mcpToolsInfo: css`
      margin-top: ${theme.spacing(1)};
      font-size: 12px;
      opacity: 0.7;
    `,
  };
};
