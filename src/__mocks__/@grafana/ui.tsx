import { dateTime, SelectableValue } from '@grafana/data';
import React, { useState } from 'react';

import { TEST_IDS } from '@/constants';

const actual = jest.requireActual('@grafana/ui');

/**
 * Mock Button Row Toolbar
 */
const ToolbarButtonRowMock = ({ leftItems, children, ...restProps }: any) => {
  return (
    <div data-testid={restProps['data-testid']}>
      {leftItems}
      {children}
    </div>
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
      className={restProps['className']}
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
        onChange(option ? option : undefined);
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
    <button {...restProps} disabled={restProps.disabled} className={restProps['className']}>
      {children}
    </button>
  );
};
const Button = jest.fn(ButtonMock);

/**
 * Tooltip
 */
const TooltipMock = ({ content, children, placement, ...restProps }: any) => {
  return (
    <div data-testid={restProps['data-testid']}>
      <p {...TEST_IDS.general.tooltipPosition.apply()}>{placement}</p>
      <div>{content}</div>
      {children}
    </div>
  );
};

const Tooltip = jest.fn(TooltipMock);

/**
 * Mock DatetimePicker component
 */
const DateTimePickerMock = ({ onChange, ...restProps }: any) => {
  return (
    <input
      data-testid={restProps['data-testid']}
      value={restProps.value}
      onChange={(event) => {
        /**
         * Clear
         */
        if (event.target.value === 'clear') {
          onChange(null);
          return;
        }

        if (onChange) {
          onChange(dateTime(event.target.value));
        }
      }}
    />
  );
};

const DateTimePicker = jest.fn(DateTimePickerMock);

/**
 * Mock DatetimePicker component
 */
const RelativeTimeRangePickerMock = ({ onChange, ...restProps }: any) => {
  return (
    <input
      data-testid={restProps['data-testid']}
      value={JSON.stringify(restProps.timeRange)}
      onChange={(event) => {
        if (onChange) {
          onChange(JSON.parse(event.target.value));
        }
      }}
    />
  );
};

const RelativeTimeRangePicker = jest.fn(RelativeTimeRangePickerMock);

/**
 * Drawer Mock
 * since grafana.ui version 11.5.1
 * ReferenceError: IntersectionObserver is not defined
 */
const DrawerMock = ({ title, children, onClose }: any) => {
  return (
    <div {...TEST_IDS.drawerElement.chatDrawer.apply()}>
      <button {...TEST_IDS.drawerElement.drawerCloseButton.apply()} onClick={() => onClose()}>
        Close
      </button>
      {title}
      {children}
    </div>
  );
};

const Drawer = jest.fn(DrawerMock);

/**
 * Icon Mock
 *
 */
const IconMock = ({ name, onClick, ...restProps }: any) => {
  return (
    <div
      onClick={() => onClick?.()}
      data-testid={restProps['data-testid']}
      className={restProps['className']}
      aria-label={restProps['aria-label']}
    >
      {name}
    </div>
  );
};

const Icon = jest.fn(IconMock);

beforeEach(() => {
  ToolbarButtonRow.mockImplementation(ToolbarButtonRowMock);
  MenuItem.mockImplementation(MenuItemMock);
  Dropdown.mockImplementation(DropdownMock);
  Select.mockImplementation(SelectMock);
  TagsInput.mockImplementation(TagsInputMock);
  Button.mockImplementation(ButtonMock);
  Tooltip.mockImplementation(TooltipMock);
  DateTimePicker.mockImplementation(DateTimePickerMock);
  RelativeTimeRangePicker.mockImplementation(RelativeTimeRangePickerMock);
  Drawer.mockImplementation(DrawerMock);
  Icon.mockImplementation(IconMock);
});

module.exports = {
  ...actual,
  Button,
  Select,
  ToolbarButtonRow,
  MenuItem,
  Dropdown,
  TagsInput,
  DateTimePicker,
  RelativeTimeRangePicker,
  Tooltip,
  Drawer,
  Icon
};
