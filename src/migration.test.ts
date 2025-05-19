import { getMigratedOptions } from './migration';
import { TimeConfigType } from './types';
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
            gridColumns: 10,
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
  });
});
