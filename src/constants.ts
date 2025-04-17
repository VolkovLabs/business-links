import { createSelector } from '@volkovlabs/jest-selectors';

/**
 * Test Identifiers
 */
export const TEST_IDS = {
  panel: {
    root: createSelector('data-testid panel'),
    alert: createSelector('data-testid panel alert'),
    tab: createSelector((name: unknown) => `data-testid panel tab-${name}`),
    buttonEmptyLink: createSelector((name: unknown) => `data-testid panel button empty-link-${name}`),
    buttonEmptySingleLink: createSelector((name: unknown) => `data-testid panel button empty-single-link-${name}`),
    buttonSingleLink: createSelector((name: unknown) => `data-testid panel button single-link-${name}`),
    buttonDropdown: createSelector((name: unknown) => `data-testid panel button dropdown-${name}`),
    dropdown: createSelector((name: unknown) => `data-testid panel dropdown-${name}`),
    dropdownMenuItem: createSelector((name: unknown) => `data-testid panel dropdown menu-item-${name}`),
  },
};
