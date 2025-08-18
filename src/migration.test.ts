import { GRID_COLUMN_SIZE, GRID_ROW_SIZE } from './constants';
import { getMigratedOptions } from './migration';
import { ButtonSize, DropdownAlign, DropdownType, TimeConfigType } from './types';
import { createGroupConfig, createLinkConfig } from './utils';

/**
 * Mock uuid v4
 */
jest.mock('uuid', () => ({
  v4: () => 'abc-123',
}));

describe('migration', () => {
  it('Should normalize groupsSorting', async () => {
    expect(await getMigratedOptions({ options: {} } as any)).toEqual(
      expect.objectContaining({
        groupsSorting: false,
      })
    );
    expect(await getMigratedOptions({ options: { groupsSorting: false } } as any)).toEqual(
      expect.objectContaining({
        groupsSorting: false,
      })
    );
    expect(await getMigratedOptions({ options: { groupsSorting: true } } as any)).toEqual(
      expect.objectContaining({
        groupsSorting: true,
      })
    );
  });

  it('Should normalize customPadding', async () => {
    expect(await getMigratedOptions({ options: {} } as any)).toEqual(
      expect.objectContaining({
        customPadding: 0,
      })
    );
    expect(await getMigratedOptions({ options: { customPadding: 5 } } as any)).toEqual(
      expect.objectContaining({
        customPadding: 5,
      })
    );
  });

  it('Should keep empty groups', async () => {
    expect(await getMigratedOptions({ options: { groups: [] } } as any)).toEqual(
      expect.objectContaining({
        groups: [],
      })
    );
  });

  it('Should migrate highlightCurrentLink option', async () => {
    const group1 = createGroupConfig({
      name: 'Group1',
      highlightCurrentLink: undefined,
      highlightCurrentTimepicker: undefined,
    });
    expect(await getMigratedOptions({ options: { groups: [group1] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            highlightCurrentLink: false,
            highlightCurrentTimepicker: false,
          }),
        ]),
      })
    );
    expect(
      await getMigratedOptions({
        options: { groups: [{ ...group1, highlightCurrentLink: false, highlightCurrentTimepicker: false }] },
      } as any)
    ).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            highlightCurrentLink: false,
            highlightCurrentTimepicker: false,
          }),
        ]),
      })
    );
    expect(
      await getMigratedOptions({
        options: { groups: [{ ...group1, highlightCurrentLink: true, highlightCurrentTimepicker: true }] },
      } as any)
    ).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            highlightCurrentLink: true,
            highlightCurrentTimepicker: true,
          }),
        ]),
      })
    );
  });

  it('Should migrate gridLayout option', async () => {
    const group1 = createGroupConfig({ name: 'Group1', gridLayout: undefined });

    expect(await getMigratedOptions({ options: { groups: [group1] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridLayout: false,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, gridLayout: false }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridLayout: false,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, gridLayout: true }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridLayout: true,
          }),
        ]),
      })
    );
  });

  it('Should migrate gridColumns option', async () => {
    const group1 = createGroupConfig({ name: 'Group1', gridColumns: undefined });

    expect(await getMigratedOptions({ options: { groups: [group1] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridColumns: GRID_COLUMN_SIZE,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, gridColumns: 15 }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridColumns: 15,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, gridColumns: 0 }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridColumns: 0,
          }),
        ]),
      })
    );
  });

  it('Should migrate manualGridLayout option', async () => {
    const group1 = createGroupConfig({ name: 'Group1', manualGridLayout: undefined });

    expect(await getMigratedOptions({ options: { groups: [group1] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            manualGridLayout: [],
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, manualGridLayout: [] }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            manualGridLayout: [],
          }),
        ]),
      })
    );

    expect(
      await getMigratedOptions({ options: { groups: [{ ...group1, manualGridLayout: [{ i: 'key' }] }] } } as any)
    ).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            manualGridLayout: [{ i: 'key' }],
          }),
        ]),
      })
    );
  });

  it('Should migrate dynamicFontSize option', async () => {
    const group1 = createGroupConfig({ name: 'Group1', dynamicFontSize: undefined });

    expect(await getMigratedOptions({ options: { groups: [group1] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            dynamicFontSize: false,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, dynamicFontSize: false }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            dynamicFontSize: false,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, dynamicFontSize: true }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            dynamicFontSize: true,
          }),
        ]),
      })
    );
  });

  it('Should migrate gridRowHeight option', async () => {
    const group1 = createGroupConfig({ name: 'Group1', gridRowHeight: undefined });

    expect(await getMigratedOptions({ options: { groups: [group1] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridRowHeight: GRID_ROW_SIZE,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, gridRowHeight: 32 }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridRowHeight: 32,
          }),
        ]),
      })
    );

    expect(await getMigratedOptions({ options: { groups: [{ ...group1, gridRowHeight: 0 }] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            gridRowHeight: 0,
          }),
        ]),
      })
    );
  });

  describe('Items in group normalization', () => {
    it('Should normalize item if "id" in item is undefined ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
      });
      const item2 = createLinkConfig({
        id: undefined,
      });

      const group = createGroupConfig({
        items: [item1, item2],
      });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const items = result.groups[0].items;
      expect(items[0].id).toEqual('item-1-test-id');
      expect(items[1].id).toEqual('abc-123');
    });

    it('Should normalize item if "id" in item is empty string or null ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
      });
      const item2 = createLinkConfig({
        id: '',
      });
      const item3 = createLinkConfig({
        id: null,
      } as any);

      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const items = result.groups[0].items;
      expect(items[0].id).toEqual('item-1-test-id');
      expect(items[1].id).toEqual('abc-123');
      expect(items[2].id).toEqual('abc-123');
    });

    it('Should normalize time config type if it is undefined ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
        timePickerConfig: {
          type: TimeConfigType.FIELD,
        },
      });
      const item2 = createLinkConfig({
        id: undefined,
        timePickerConfig: {
          type: undefined,
        },
      });
      const item3 = createLinkConfig({
        id: undefined,
        timePickerConfig: undefined,
      });
      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const items = result.groups[0].items;
      expect(items[0].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[1].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[2].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
    });

    it('Should normalize time config type if it is empty string or null ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
        timePickerConfig: {
          type: TimeConfigType.FIELD,
        },
      });
      const item2 = createLinkConfig({
        id: undefined,
        timePickerConfig: {
          type: '',
        } as any,
      });
      const item3 = createLinkConfig({
        id: undefined,
        timePickerConfig: null as any,
      });
      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const items = result.groups[0].items;
      expect(items[0].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[1].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[2].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
    });

    it('Should normalize dropdown config if null or undefined ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
        dropdownConfig: {
          type: DropdownType.ROW,
          align: DropdownAlign.RIGHT,
          buttonSize: ButtonSize.LG,
        },
      });
      const item2 = createLinkConfig({
        id: 'item-2-test-id',
        dropdownConfig: undefined,
      });

      const item3 = createLinkConfig({
        id: 'item-3-test-id',
        dropdownConfig: null,
      } as any);

      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const items = result.groups[0].items;
      expect(items[0].dropdownConfig?.type).toEqual(DropdownType.ROW);
      expect(items[1].dropdownConfig?.type).toEqual(DropdownType.DROPDOWN);
      expect(items[2].dropdownConfig?.type).toEqual(DropdownType.DROPDOWN);

      expect(items[0].dropdownConfig?.align).toEqual(DropdownAlign.RIGHT);
      expect(items[1].dropdownConfig?.align).toEqual(DropdownAlign.LEFT);
      expect(items[2].dropdownConfig?.align).toEqual(DropdownAlign.LEFT);

      expect(items[0].dropdownConfig?.buttonSize).toEqual(ButtonSize.LG);
      expect(items[1].dropdownConfig?.buttonSize).toEqual(ButtonSize.MD);
      expect(items[2].dropdownConfig?.buttonSize).toEqual(ButtonSize.MD);
    });

    it('Should normalize kiosk mode', async () => {
      const item1 = createLinkConfig({
        includeKioskMode: undefined,
      });
      const item2 = createLinkConfig({
        includeKioskMode: false,
      });
      const item3 = createLinkConfig({
        includeKioskMode: true,
      });

      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const items = result.groups[0].items;
      expect(items[0].includeKioskMode).toEqual(false);
      expect(items[1].includeKioskMode).toEqual(false);
      expect(items[2].includeKioskMode).toEqual(true);
    });

    it('Should normalize showCustomIcons to false and customIconUrl to empty string', async () => {
      const item = createLinkConfig({ id: 'item-without-icons' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const normalizedItem = result.groups[0].items[0];

      expect(normalizedItem.showCustomIcons).toEqual(false);
      expect(normalizedItem.customIconUrl).toEqual('');
    });

    it('Should normalize hideTooltipOnHover to false', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const normalizedItem = result.groups[0].items[0];

      expect(normalizedItem.hideTooltipOnHover).toBe(false);
    });

    it('Should normalize alignContentPosition to left', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { groups: [group] } } as any);
      const normalizedItem = result.groups[0].items[0];

      expect(normalizedItem.alignContentPosition).toBe('left');
    });
  });

  describe('Items in dropdowns', () => {
    it('Should normalize item if "id" in item is undefined ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
      });
      const item2 = createLinkConfig({
        id: undefined,
      });

      const group = createGroupConfig({
        items: [item1, item2],
      });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const items = result.dropdowns[0].items;
      expect(items[0].id).toEqual('item-1-test-id');
      expect(items[1].id).toEqual('abc-123');
    });

    it('Should normalize item if "id" in item is empty string or null ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
      });
      const item2 = createLinkConfig({
        id: '',
      });
      const item3 = createLinkConfig({
        id: null,
      } as any);

      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const items = result.dropdowns[0].items;
      expect(items[0].id).toEqual('item-1-test-id');
      expect(items[1].id).toEqual('abc-123');
      expect(items[2].id).toEqual('abc-123');
    });

    it('Should normalize time config type if it is undefined ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
        timePickerConfig: {
          type: TimeConfigType.FIELD,
        },
      });
      const item2 = createLinkConfig({
        id: undefined,
        timePickerConfig: {
          type: undefined,
        },
      });
      const item3 = createLinkConfig({
        id: undefined,
        timePickerConfig: undefined,
      });
      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const items = result.dropdowns[0].items;
      expect(items[0].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[1].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[2].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
    });

    it('Should normalize time config type if it is empty string or null ', async () => {
      const item1 = createLinkConfig({
        id: 'item-1-test-id',
        timePickerConfig: {
          type: TimeConfigType.FIELD,
        },
      });
      const item2 = createLinkConfig({
        id: undefined,
        timePickerConfig: {
          type: '',
        } as any,
      });
      const item3 = createLinkConfig({
        id: undefined,
        timePickerConfig: null as any,
      });
      const group = createGroupConfig({
        items: [item1, item2, item3],
      });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const items = result.dropdowns[0].items;
      expect(items[0].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[1].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
      expect(items[2].timePickerConfig?.type).toEqual(TimeConfigType.FIELD);
    });

    it('Should normalize hideTooltipOnHover to false', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', hideTooltipOnHover: undefined });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.hideTooltipOnHover).toBe(false);
    });

    it('Should normalize hideTooltipOnHover to false if not specified', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.hideTooltipOnHover).toBe(false);
    });

    it('Should normalize hideTooltipOnHover ', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', hideTooltipOnHover: true });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.hideTooltipOnHover).toBe(true);
    });

    it('Should normalize useDefaultGrafanaMcp to false', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', useDefaultGrafanaMcp: undefined });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.hideTooltipOnHover).toBe(false);
    });

    it('Should normalize useDefaultGrafanaMcp to false if not specified', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.useDefaultGrafanaMcp).toBe(false);
    });

    it('Should normalize useDefaultGrafanaMcp ', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', useDefaultGrafanaMcp: true });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.useDefaultGrafanaMcp).toBe(true);
    });

    it('Should normalize showCustomIcons to false', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', showCustomIcons: undefined });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.showCustomIcons).toBe(false);
    });

    it('Should normalize showCustomIcons to false if not specified', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.showCustomIcons).toBe(false);
    });

    it('Should normalize showCustomIcons ', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', showCustomIcons: true });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.showCustomIcons).toBe(true);
    });

    it('Should normalize includeKioskMode to false', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', includeKioskMode: undefined });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.includeKioskMode).toBe(false);
    });

    it('Should normalize includeKioskMode to false if not specified', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.includeKioskMode).toBe(false);
    });

    it('Should normalize includeKioskMode ', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', includeKioskMode: true });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.includeKioskMode).toBe(true);
    });

    it('Should normalize customIconUrl to false', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', customIconUrl: undefined });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.customIconUrl).toBe('');
    });

    it('Should normalize customIconUrl to false if not specified', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.customIconUrl).toBe('');
    });

    it('Should normalize customIconUrl ', async () => {
      const item = createLinkConfig({ id: 'item-1-test-id', customIconUrl: 'url' });
      const group = createGroupConfig({ items: [item] });

      const result = await getMigratedOptions({ options: { dropdowns: [group] } } as any);
      const normalizedItem = result.dropdowns[0].items[0];

      expect(normalizedItem.customIconUrl).toBe('url');
    });
  });
});
