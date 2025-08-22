import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export const getStyles = (theme: GrafanaTheme2) => {
  return {
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
  };
};
