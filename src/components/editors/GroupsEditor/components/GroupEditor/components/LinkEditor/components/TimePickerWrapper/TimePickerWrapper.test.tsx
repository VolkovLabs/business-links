import { act, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';
import { config } from '@grafana/runtime';
import { TEST_IDS } from '@/constants';

import { TimePickerWrapper } from './TimePickerWrapper';

type Props = React.ComponentProps<typeof TimePickerWrapper>;

const inTestIds = {
  childButton: createSelector('data-testid child-button'),
  childSection: createSelector('data-testid child-section'),
};

describe('TimePickerWrapper', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.timePickerWrapper, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <TimePickerWrapper>
        {props.children}
        <button {...inTestIds.childButton.apply()}>Child Button</button>
        <section role="dialog" {...inTestIds.childSection.apply()}>
          Section element
        </section>
      </TimePickerWrapper>
    );
  };

  beforeEach(() => {
    /**
     * Set default version
     * by default config returns invalid version 1.0 cause error in test
     */
    Object.assign(config, {
      buildInfo: { version: '12.0.0' },
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('Should render component', () => {
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should render component with child', () => {
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.childButton()).toBeInTheDocument();
  });

  it('Should update section position if Grafana < 12', async () => {
    /**
     * Set version 11.5.0
     * by default config returns invalid version 1.0 cause error in test
     */
    Object.assign(config, {
      buildInfo: { version: '11.5.0' },
    });

    render(getComponent({}));

    await act(() => {
      const div = document.createElement('div');
      document.body.appendChild(div);
    });

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.childButton()).toBeInTheDocument();
    expect(selectors.childSection()).toBeInTheDocument();

    expect(selectors.childSection()).toHaveStyle({ position: 'fixed' });
  });

  it('Should not update section position if Grafana > 12', async () => {
    /**
     * Set version 11.5.0
     * by default config returns invalid version 1.0 cause error in test
     */
    Object.assign(config, {
      buildInfo: { version: '12.1.0' },
    });

    render(getComponent({}));

    await act(() => {
      const div = document.createElement('div');
      document.body.appendChild(div);
    });

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.childButton()).toBeInTheDocument();
    expect(selectors.childSection()).toBeInTheDocument();

    expect(selectors.childSection()).not.toHaveStyle({ position: 'fixed' });
  });
});
