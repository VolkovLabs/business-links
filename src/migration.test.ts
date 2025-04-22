import { getMigratedOptions } from './migration';
import { createGroupConfig } from './utils';

describe('migration', () => {
  it('Should keep empty groups', async () => {
    expect(await getMigratedOptions({ options: { groups: [] } } as any)).toEqual(
      expect.objectContaining({
        groups: [],
      })
    );
  });

  it('Should migrate highlightCurrentLink option', async () => {
    const group1 = createGroupConfig({ name: 'Group1', highlightCurrentLink: undefined });
    expect(await getMigratedOptions({ options: { groups: [group1] } } as any)).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            highlightCurrentLink: false,
          }),
        ]),
      })
    );
    expect(
      await getMigratedOptions({ options: { groups: [{ ...group1, highlightCurrentLink: false }] } } as any)
    ).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            highlightCurrentLink: false,
          }),
        ]),
      })
    );
    expect(
      await getMigratedOptions({ options: { groups: [{ ...group1, highlightCurrentLink: true }] } } as any)
    ).toEqual(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Group1',
            highlightCurrentLink: true,
          }),
        ]),
      })
    );
    // expect(await getMigratedOptions({ options: { groupsSorting: false } } as any)).toEqual(
    //   expect.objectContaining({
    //     groupsSorting: false,
    //   })
    // );
    // expect(await getMigratedOptions({ options: { groupsSorting: true } } as any)).toEqual(
    //   expect.objectContaining({
    //     groupsSorting: true,
    //   })
    // );
  });
});
