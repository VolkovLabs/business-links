import { cx } from '@emotion/css';
import { textUtil } from '@grafana/data';
import { Icon, Tooltip, useStyles2 } from '@grafana/ui';
import MarkdownIt from 'markdown-it';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { ChatMessage, LlmRole } from '@/types';
import { formatFileSize, getSenderDisplayName } from '@/utils';

import { LoadingBar } from '../LoadingBar';
import { getStyles } from './ChatMessageCard.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.messageCard;

/**
 * Properties for the ChatDrawer component
 */
interface Props {
  /**
   * Message item
   *
   * @type {ChatMessage}
   */
  message: ChatMessage;

  /**
   * Assistant name
   *
   * @type {ChatMessage}
   */
  assistantName?: string;
}

/**
 * Markdown it
 */
const md = new MarkdownIt({
  html: true,
});

/**
 * Chat Message Card
 */
export const ChatMessageCard: React.FC<Props> = ({ message, assistantName }) => {
  /**
   * Hooks
   */
  const styles = useStyles2(getStyles);

  /**
   * Custom assistant name, defaults to 'Business AI'
   */
  const customAssistantName = assistantName || 'Business AI';
  return message?.text || (message?.attachments && !!message?.attachments.length) ? (
    <div
      className={cx(
        styles.messageRow,
        message.sender === LlmRole.USER ? styles.messageRowUser : styles.messageRowAssistant
      )}
      {...testIds.message.apply(message.id)}
    >
      <div
        className={cx(
          styles.messageContent,
          message.sender === LlmRole.USER
            ? styles.messageContentUser
            : message.sender === LlmRole.SYSTEM || message.isError
              ? styles.messageContentError
              : message.sender === LlmRole.TOOL
                ? styles.messageContentTool
                : styles.messageContentAssistant
        )}
      >
        <div className={styles.messageSender} {...testIds.messageSender.apply(message.sender)}>
          {getSenderDisplayName(message.sender, customAssistantName)}
        </div>
        {message.isTemporaryAnswer ? (
          <Tooltip content={<div>{message.text}</div>} theme="info" {...testIds.tooltipMenu.apply(message.id)}>
            <div className={styles.loadingMessage}>
              <Icon size="md" name="gf-ml" />
              <div className={styles.loadingMessage} {...testIds.messageAwait.apply(message.id)}>
                Answer
                <LoadingBar />
              </div>
            </div>
          </Tooltip>
        ) : (
          <div className={styles.messageTextWrap} {...testIds.textContainer.apply(message.id)}>
            <div
              className={styles.messageText}
              dangerouslySetInnerHTML={{ __html: textUtil.sanitize(md.render(message.text)) }}
            />
          </div>
        )}
        {message.isStreaming && <LoadingBar />}
        {message.attachments && message.attachments.length > 0 && (
          <div className={styles.attachmentsContainer}>
            {message.attachments.map((file) =>
              file.name ? (
                <div key={file.id} {...testIds.attachment.apply()}>
                  <div className={styles.fileDetails}>
                    <span className={styles.fileTypeIcon}>
                      {file.type.startsWith('image/') ? (
                        <Icon name="gf-landscape" {...testIds.attachmentImageIcon.apply()} />
                      ) : (
                        <Icon name="file-alt" />
                      )}
                    </span>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>({formatFileSize(file.size)})</span>
                    {file.url && (
                      <img
                        src={file.url}
                        alt={file.name}
                        {...testIds.attachmentImage.apply(file.name)}
                        className={styles.fileThumbnail}
                      />
                    )}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;
};
