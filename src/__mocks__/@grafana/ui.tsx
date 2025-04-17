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

beforeEach(() => {
  ToolbarButtonRow.mockImplementation(ToolbarButtonRowMock);
  MenuItem.mockImplementation(MenuItemMock);
  Dropdown.mockImplementation(DropdownMock);
});

module.exports = {
  ...actual,
  ToolbarButtonRow,
  MenuItem,
  Dropdown,
};
