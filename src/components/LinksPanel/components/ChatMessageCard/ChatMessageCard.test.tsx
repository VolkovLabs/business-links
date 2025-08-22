import { render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { ChatMessageCard } from './ChatMessageCard';
import { createChatMessage } from '@/utils';
import { LlmRole } from '@/types';
import { LoadingBar } from '../LoadingBar';

/**
 * Props
 */
type Props = React.ComponentProps<typeof ChatMessageCard>;

/**
 * In Test Ids
 */
const inTestIds = {
  loadingBar: createSelector('data-testid loading-bar'),
};

/**
 * Mock loading Bar
 */
const LoadingBarMock = () => <div {...inTestIds.loadingBar.apply()} />;

jest.mock('../LoadingBar', () => ({
  LoadingBar: jest.fn(),
}));

/**
 * Element ChatMessageCard
 */
describe('ChatMessageCard', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.messageCard,
    ...inTestIds,
  });

  /**
   * Selectors
   */
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <ChatMessageCard {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(LoadingBar).mockImplementation(LoadingBarMock);
  });

  it('Should render Messages', async () => {
    render(getComponent({ message: createChatMessage({ id: '1', sender: LlmRole.USER, text: 'Request' }) }));

    expect(selectors.message(false, '1')).toBeInTheDocument();
  });

  it('Should render Messages as Markdown', async () => {
    render(getComponent({ message: createChatMessage({ id: '1', sender: LlmRole.USER, text: '# Hello' }) }));

    expect(selectors.message(false, '1')).toBeInTheDocument();
    expect(selectors.textContainer(false, '1')).toBeInTheDocument();
    expect(selectors.textContainer(false, '1')).toContainHTML('<h1>Hello</h1>');
  });

  it('Should not render message if none Messages', async () => {
    render(getComponent({}));

    expect(selectors.message(true, '1')).not.toBeInTheDocument();
  });

  it('Should render Messages wit tools', async () => {
    render(getComponent({ message: createChatMessage({ id: '1', sender: LlmRole.TOOL, text: 'Tool message' }) }));

    expect(selectors.message(false, '1')).toBeInTheDocument();
    expect(selectors.messageSender(false, LlmRole.TOOL)).toBeInTheDocument();
  });

  it('Should render Messages wit tools and tooltip if temporary answer', async () => {
    render(
      getComponent({
        message: createChatMessage({ id: '1', sender: LlmRole.TOOL, text: 'Tool message', isTemporaryAnswer: true }),
      })
    );

    expect(selectors.message(false, '1')).toBeInTheDocument();
    expect(selectors.messageSender(false, LlmRole.TOOL)).toBeInTheDocument();
    expect(selectors.tooltipMenu(false, '1')).toBeInTheDocument();
    expect(selectors.loadingBar()).toBeInTheDocument();
  });

  it('Should display loading bar for streaming', async () => {
    render(
      getComponent({
        message: createChatMessage({ id: '1', sender: LlmRole.ASSISTANT, text: 'Tool message', isStreaming: true }),
      })
    );

    expect(selectors.message(false, '1')).toBeInTheDocument();
    expect(selectors.loadingBar()).toBeInTheDocument();
  });

  it('Should display attachments', async () => {
    render(
      getComponent({
        message: createChatMessage({
          id: '1',
          sender: LlmRole.ASSISTANT,
          text: 'Tool message',
          attachments: [
            {
              name: 'Att-1',
              id: 'Att-1',
              size: 500,
              type: 'image/jpg',
              content: 'someContent',
              url: 'some-url',
            },
          ],
        }),
      })
    );

    expect(selectors.message(false, '1')).toBeInTheDocument();
    expect(selectors.attachment()).toBeInTheDocument();
    expect(selectors.attachmentImageIcon()).toBeInTheDocument();
    expect(selectors.attachmentImage(false, 'Att-1')).toBeInTheDocument();
  });

  it('Should display attachments with alternative icon', async () => {
    render(
      getComponent({
        message: createChatMessage({
          id: '1',
          sender: LlmRole.ASSISTANT,
          text: 'Tool message',
          attachments: [
            {
              name: 'Att-1',
              id: 'Att-1',
              size: 500,
              type: 'pdf',
              content: 'someContent',
              url: 'some-url',
            },
          ],
        }),
      })
    );

    expect(selectors.attachmentImageIcon(true)).not.toBeInTheDocument();
  });

  it('Should not display attachments if no name fot it', async () => {
    render(
      getComponent({
        message: createChatMessage({
          id: '1',
          sender: LlmRole.ASSISTANT,
          text: 'Tool message',
          attachments: [
            {
              name: '',
              id: 'Att-1',
              size: 500,
              type: 'pdf',
              content: 'someContent',
              url: 'some-url',
            },
          ],
        }),
      })
    );

    expect(selectors.attachment(true)).not.toBeInTheDocument();
  });
});
