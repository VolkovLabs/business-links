import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';

import { LoadingBar } from './LoadingBar';

/**
 * Props
 */
type Props = React.ComponentProps<typeof LoadingBar>;

/**
 * Element
 */
describe('MenuElement', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.loadingBar,
  });

  /**
   * Selectors
   */
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <LoadingBar {...(props as any)} />;
  };

  it('Should render Loading Bar', async () => {
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
  });
});
