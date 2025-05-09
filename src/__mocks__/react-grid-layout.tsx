import React from 'react';

import { TEST_IDS } from '@/constants';

const ReactGridLayout = ({ children, onLayoutChange }: any) => {
  const mockOnLayoutChange = onLayoutChange;

  return (
    <div {...TEST_IDS.gridLayout.mockGridLayout.apply()}>
      {children}
      <input
        {...TEST_IDS.gridLayout.mockFieldInputChangeLayout.apply()}
        type="text"
        onChange={(e) => {
          try {
            const layout = JSON.parse(e.target.value);
            mockOnLayoutChange?.(layout);
          } catch {
            // eslint-disable-next-line no-console
            console.warn('Invalid layout JSON');
          }
        }}
      />
    </div>
  );
};

export default ReactGridLayout;
