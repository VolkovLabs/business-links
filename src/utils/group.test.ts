import { reorder } from './group';

/**
 * Reorder
 */
describe('reorder', () => {
  it('Should move item from startIndex to endIndex', () => {
    const list = ['item 1', 'item 2', 'item 3', 'item 4'];
    const result = reorder(list, 1, 3);
    expect(result).toEqual(['item 1', 'item 3', 'item 4', 'item 2']);
  });

  it('Should return a new array, not mutate the original', () => {
    const list = ['x', 'y', 'z'];
    const original = [...list];
    reorder(list, 0, 2);
    expect(list).toEqual(original);
  });

  it('Should handle moving item to the same index', () => {
    const list = ['1', '2', '3'];
    const result = reorder(list, 1, 1);
    expect(result).toEqual(['1', '2', '3']);
  });

  it('Should move item to the beginning of the list', () => {
    const list = ['a', 'b', 'c'];
    const result = reorder(list, 2, 0);
    expect(result).toEqual(['c', 'a', 'b']);
  });
});
