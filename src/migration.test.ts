import { getMigratedOptions } from './migration';

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
});
