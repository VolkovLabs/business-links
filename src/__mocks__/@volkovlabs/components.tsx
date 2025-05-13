import React from 'react';

const actual = jest.requireActual('@volkovlabs/components');

/**
 * Mock Slider
 */
const SliderMock = ({ onChange, value, onAfterChange, ...restProps }: any) => {
  return (
    <input
      type="range"
      onChange={(event) => {
        if (onChange) {
          onChange(Number(event.target.value));
        }
      }}
      onBlur={(event) => {
        if (onAfterChange) {
          onAfterChange(Number(event.target.value));
        }
      }}
      data-testid={restProps['data-testid']}
      value={value}
    />
  );
};

const Slider = jest.fn(SliderMock);

beforeEach(() => {
  Slider.mockImplementation(SliderMock);
});

module.exports = {
  ...actual,
  Slider,
};
