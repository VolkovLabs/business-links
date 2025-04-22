import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createGroupConfig, createLinkConfig, getAllDashboards } from '@/utils';

import { GroupEditor } from './components';
import { GroupsEditor } from './GroupsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof GroupsEditor>;

/**
 * In Test Ids
 */
const inTestIds = {
  groupEditor: createSelector('data-testid group-editor'),
  buttonLevelsUpdate: createSelector('data-testid button-levels-update'),
};

/**
 * Mock Table Editor
 */
const TableEditorMock = () => <div {...inTestIds.groupEditor.apply()} />;

jest.mock('./components', () => ({
  GroupEditor: jest.fn(),
}));

/**
 * Mock getAllDashboards utils
 */
jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  getAllDashboards: jest.fn(),
}));

describe('TablesEditor', () => {
  /**
   * Default
   */
  const defaultDropdowns = [{ name: 'Dropdown1', items: [] }];
  const defaultOptionId = 'groups';
  const group1 = createGroupConfig();
  const group2 = createGroupConfig({ name: 'Group 2' });

  const link1 = createLinkConfig({ name: 'Link 1' });
  const link2 = createLinkConfig({ name: 'Link 2' });

  const optionsDefault = {
    dropdowns: defaultDropdowns,
  };

  const dashboardsMock = [
    {
      id: 1,
      tags: [],
      title: 'Test dashboard 1',
      type: 'dash-db',
      uid: 'test123',
      uri: 'db/test',
      url: '/d/test123/test',
    },
    {
      id: 2,
      tags: [],
      title: 'Test dashboard 2',
      type: 'dash-db',
      uid: 'test12345',
      uri: 'db/test2',
      url: '/d/test12345/test',
    },
  ] as any;

  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <GroupsEditor {...(props as any)} />;

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.groupsEditor,
    ...inTestIds,
  });

  const selectors = getSelectors(screen);

  beforeEach(() => {
    jest.mocked(GroupEditor).mockImplementation(TableEditorMock);
    jest.mocked(getAllDashboards).mockReturnValue(dashboardsMock);
  });

  it('Should render tables', async () => {
    await act(async () =>
      render(
        getComponent({
          context: {
            options: optionsDefault,
          } as any,
          value: [group1, group2],
          id: defaultOptionId,
        })
      )
    );

    expect(selectors.itemHeader(false, 'Group')).toBeInTheDocument();
    expect(selectors.itemHeader(false, 'Group 2')).toBeInTheDocument();

    expect(selectors.noItemsMessage(true)).not.toBeInTheDocument();
  });

  it('Should render if groups unspecified', async () => {
    await act(async () =>
      render(
        getComponent({
          context: {
            options: {} as any,
          } as any,
          value: [],
        })
      )
    );

    expect(selectors.newItem()).toBeInTheDocument();
    expect(selectors.noItemsMessage()).toBeInTheDocument();
  });

  it('Should add new group', async () => {
    const onChange = jest.fn();

    await act(async () =>
      render(
        getComponent({
          context: {
            options: optionsDefault,
          } as any,
          onChange,
          value: [group1, group2],
          id: defaultOptionId,
        })
      )
    );

    await act(() => fireEvent.change(selectors.newItemName(), { target: { value: 'Group3' } }));

    expect(selectors.buttonAddNew()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).not.toBeDisabled();

    await act(() => fireEvent.click(selectors.buttonAddNew()));

    expect(onChange).toHaveBeenCalledWith([group1, group2, createGroupConfig({ name: 'Group3' })]);
  });

  it('Should remove group', async () => {
    const onChange = jest.fn();

    await act(async () =>
      render(
        getComponent({
          context: {
            options: optionsDefault,
          } as any,
          onChange,
          value: [group1, group2],
          id: defaultOptionId,
        })
      )
    );

    const item2 = selectors.itemHeader(false, 'Group 2');
    const item2Selectors = getSelectors(within(item2));

    /**
     * Check field presence
     */
    expect(item2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(item2Selectors.buttonRemove()));

    expect(onChange).toHaveBeenCalledWith([{ name: 'Group', items: [], highlightCurrentLink: false }]);
  });

  describe('Rename', () => {
    it('Should save new group name', async () => {
      const onChange = jest.fn();

      await act(async () =>
        render(
          getComponent({
            context: {
              options: optionsDefault,
            } as any,
            onChange,
            value: [group1, group2],
            id: defaultOptionId,
          })
        )
      );

      const item1 = selectors.itemHeader(false, 'Group');
      const item1Selectors = getSelectors(within(item1));
      const item2 = selectors.itemHeader(false, 'Group 2');
      const item2Selectors = getSelectors(within(item2));

      /**
       * Check item presence
       */
      expect(item2).toBeInTheDocument();

      /**
       * Check rename is not started
       */
      expect(item1Selectors.fieldName(true)).not.toBeInTheDocument();
      expect(item2Selectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(item2Selectors.buttonStartRename()));

      /**
       * Check rename is started only for item2
       */
      expect(item1Selectors.fieldName(true)).not.toBeInTheDocument();
      expect(item2Selectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(item2Selectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Save Name
       */
      expect(item2Selectors.buttonSaveRename()).not.toBeDisabled();
      fireEvent.click(item2Selectors.buttonSaveRename());

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        { name: 'Group', items: [], highlightCurrentLink: false },
        { name: 'hello', items: [], highlightCurrentLink: false },
      ]);
    });

    it('Should cancel renaming', async () => {
      const onChange = jest.fn();

      await act(async () =>
        render(
          getComponent({
            context: {
              options: optionsDefault,
            } as any,
            onChange,
            value: [group1, group2],
            id: defaultOptionId,
          })
        )
      );

      const item = selectors.itemHeader(false, 'Group 2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Cancel Renaming
       */
      expect(itemSelectors.buttonCancelRename()).not.toBeDisabled();
      fireEvent.click(itemSelectors.buttonCancelRename());

      /**
       * Check if renaming canceled
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Check if not saved
       */
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Should not allow to save invalid name', async () => {
      const onChange = jest.fn();

      await act(async () =>
        render(
          getComponent({
            context: {
              options: optionsDefault,
            } as any,
            onChange,
            value: [group1, group2],
            id: defaultOptionId,
          })
        )
      );

      const item = selectors.itemHeader(false, 'Group');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'Group 2' } });

      /**
       * Check if unable to save with the same name
       */
      expect(itemSelectors.buttonSaveRename()).toBeDisabled();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: '' } });

      /**
       * Check if unable to save
       */
      expect(itemSelectors.buttonSaveRename()).toBeDisabled();
    });

    it('Should save name by enter', async () => {
      const onChange = jest.fn();

      await act(async () =>
        render(
          getComponent({
            context: {
              options: optionsDefault,
            } as any,
            onChange,
            value: [group1, group2],
            id: defaultOptionId,
          })
        )
      );

      const item = selectors.itemHeader(false, 'Group 2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Press Enter
       */
      await act(async () => fireEvent.keyDown(selectors.fieldName(), { key: 'Enter' }));

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        { name: 'Group', items: [], highlightCurrentLink: false },
        { name: 'hello', items: [], highlightCurrentLink: false },
      ]);
    });

    it('Should cancel renaming by escape', async () => {
      const onChange = jest.fn();

      await act(async () =>
        render(
          getComponent({
            context: {
              options: optionsDefault,
            } as any,
            onChange,
            value: [group1, group2],
            id: defaultOptionId,
          })
        )
      );

      const item = selectors.itemHeader(false, 'Group 2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Press Escape
       */
      await act(async () => fireEvent.keyDown(selectors.fieldName(), { key: 'Escape' }));

      /**
       * Check if renaming canceled
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Check if not saved
       */
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Should keep toggled state after save', async () => {
      const onChange = jest.fn();

      const { rerender } = await act(async () =>
        render(
          getComponent({
            context: {
              options: optionsDefault,
            } as any,
            onChange,
            value: [group1, group2],
            id: defaultOptionId,
          })
        )
      );

      const item = selectors.itemHeader(false, 'Group 2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Expand Item
       */
      fireEvent.click(item);

      /**
       * Check if item expanded
       */
      expect(selectors.groupEditor()).toBeInTheDocument();

      /**
       * Check rename is not started
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Save Name
       */
      expect(itemSelectors.buttonSaveRename()).not.toBeDisabled();
      fireEvent.click(itemSelectors.buttonSaveRename());

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        createGroupConfig({ name: 'Group', items: [] }),
        createGroupConfig({ name: 'hello', items: [] }),
      ]);

      /**
       * Rerender
       */
      rerender(
        getComponent({
          context: {
            options: {},
          } as any,
          value: [group1, createGroupConfig({ name: 'hello', items: [] })],
        })
      );

      /**
       * Check if item still expanded
       */
      expect(selectors.groupEditor()).toBeInTheDocument();
    });
  });

  it('Should show group content', async () => {
    const onChange = jest.fn();

    await act(async () =>
      render(
        getComponent({
          context: {
            options: optionsDefault,
          } as any,
          onChange,
          value: [group1, group2],
          id: defaultOptionId,
        })
      )
    );

    const item1 = selectors.itemHeader(false, 'Group');

    /**
     * Check field presence
     */
    expect(item1).toBeInTheDocument();

    /**
     * Open
     */
    await act(() => fireEvent.click(item1));

    expect(selectors.groupEditor()).toBeInTheDocument();
  });

  it('Should update item', async () => {
    const onChange = jest.fn();

    const group1 = createGroupConfig({
      name: 'group1',
      items: [link1, link2],
    });

    jest.mocked(GroupEditor).mockImplementation(({ onChange }) => (
      <div {...inTestIds.groupEditor.apply()}>
        <button
          {...inTestIds.buttonLevelsUpdate.apply()}
          onClick={() => {
            /**
             * Simulate group change remove links
             */
            onChange({ ...group1, items: [] });
          }}
        />
      </div>
    ));

    await act(async () =>
      render(
        getComponent({
          context: {
            options: optionsDefault,
          } as any,
          onChange,
          value: [group1, group2],
          id: defaultOptionId,
        })
      )
    );

    /**
     * Open group1
     */
    fireEvent.click(selectors.itemHeader(false, 'group1'));
    expect(selectors.itemContent(false, 'group1')).toBeInTheDocument();

    /**
     * Simulate group change
     */
    fireEvent.click(selectors.buttonLevelsUpdate());

    expect(onChange).toHaveBeenCalledWith([
      createGroupConfig({
        name: 'group1',
        items: [],
      }),
      createGroupConfig({
        name: 'Group 2',
        items: [],
      }),
    ]);
  });

  it('Should reorder items', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};

    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });

    const onChange = jest.fn();

    await act(async () =>
      render(
        getComponent({
          context: {
            options: optionsDefault,
          } as any,
          onChange,
          value: [group1, group2],
          id: defaultOptionId,
        })
      )
    );

    /**
     * Simulate drop field 1 to index 0
     */
    act(() =>
      onDragEndHandler({
        destination: {
          index: 0,
        },
        source: {
          index: 1,
        },
      } as any)
    );

    expect(onChange).toHaveBeenCalledWith([
      {
        name: 'Group 2',
        items: expect.any(Array),
        highlightCurrentLink: false,
      },
      {
        name: 'Group',
        items: expect.any(Array),
        highlightCurrentLink: false,
      },
    ]);
  });

  it('Should not reorder items if drop outside the list', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });
    const onChange = jest.fn();

    await act(async () =>
      render(
        getComponent({
          context: {
            options: optionsDefault,
          } as any,
          onChange,
          value: [group1, group2],
          id: defaultOptionId,
        })
      )
    );

    /**
     * Simulate drop field 1 to outside the list
     */
    act(() =>
      onDragEndHandler({
        destination: null,
        source: {
          index: 1,
        },
      } as any)
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
