import { SelectableValue } from '@grafana/data';
import React, { useState } from 'react';

const actual = jest.requireActual('@grafana/ui');

/**
 * Mock Button Row Toolbar
 */
const ToolbarButtonRowMock = ({ leftItems, children }: any) => {
  return (
    <>
      {leftItems}
      {children}
    </>
  );
};

const ToolbarButtonRow = jest.fn(ToolbarButtonRowMock);

/**
 * Mock Menu item component
 */
const MenuItemMock = ({ onClick, children, currentPage, numberOfPages, ...restProps }: any) => {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      aria-label={restProps['aria-label']}
      data-testid={restProps['data-testid']}
    >
      {restProps.label}
    </button>
  );
};

const MenuItem = jest.fn(MenuItemMock);

/**
 * Mock Dropdown component
 */
const DropdownMock = ({ children, overlay, ...restProps }: any) => {
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <div data-testid={restProps['data-testid']} onClick={() => setOpenMenu((prevState) => !prevState)}>
      {openMenu && <div>{overlay}</div>}
      {children}
    </div>
  );
};

const Dropdown = jest.fn(DropdownMock);

/**
 * Mock Select component
 */
const SelectMock = ({
  options,
  onChange,
  value,
  isMulti,
  isClearable,
  allowCustomValue,
  invalid,
  noOptionsMessage,
  formatOptionLabel,
  isLoading,
  onOpenMenu,
  onCloseMenu,
  inputId,
  isSearchable,
  ...restProps
}: any) => (
  <select
    onChange={(event: any) => {
      const plainOptions = options.reduce(
        (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
        []
      );

      // eslint-disable-next-line eqeqeq
      const option = plainOptions.find((option: any) => option.value == event.currentTarget.values);

      if (onChange) {
        onChange(
          option
            ? option
            : {
                value: 'unable to find option',
              }
        );
      }
    }}
    /**
     * Fix jest warnings because null value.
     * For Select component in @grafana/ui should be used null to reset value.
     */
    value={value === null ? '' : value?.value || value}
    multiple={isMulti}
    {...restProps}
  >
    {isClearable && (
      <option key="clear" value="">
        Clear
      </option>
    )}
    {(allowCustomValue
      ? (Array.isArray(value) ? value : [value])
          .map((value: string) => ({
            value,
            label: value,
          }))
          .concat(options.filter((option: any) => option.value !== value))
      : options.reduce(
          (acc: SelectableValue[], option: SelectableValue) => acc.concat(option.options ? option.options : option),
          []
        )
    ).map(({ label, value }: any, index: number) => (
      <option key={index} value={value}>
        {label}
      </option>
    ))}
  </select>
);

const Select = jest.fn(SelectMock);

/**
 * Mock TagsInput component
 */
const TagsInputMock = ({ onChange, value, ...restProps }: any) => {
  return (
    <input
      data-testid={restProps['data-testid']}
      value={value}
      onChange={(event) => {
        if (onChange) {
          onChange(event.target.value);
        }
      }}
    />
  );
};

const TagsInput = jest.fn(TagsInputMock);

/**
 * Button
 */
const ButtonMock = ({ children, ...restProps }: any) => {
  return (
    <button {...restProps} disabled={restProps.disabled}>
      {children}
    </button>
  );
};
const Button = jest.fn(ButtonMock);

beforeEach(() => {
  ToolbarButtonRow.mockImplementation(ToolbarButtonRowMock);
  MenuItem.mockImplementation(MenuItemMock);
  Dropdown.mockImplementation(DropdownMock);
  Select.mockImplementation(SelectMock);
  TagsInput.mockImplementation(TagsInputMock);
  Button.mockImplementation(ButtonMock);
});

module.exports = {
  ...actual,
  Button,
  Select,
  ToolbarButtonRow,
  MenuItem,
  Dropdown,
  TagsInput,
};
