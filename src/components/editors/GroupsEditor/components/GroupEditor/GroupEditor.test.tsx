import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createLinkConfig } from '@/utils';

import { LinkEditor } from './components';
import { GroupEditor } from './GroupEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof GroupEditor>;

const inTestIds = {
  linkEditor: createSelector('data-testid links-editor'),
  buttonLevelsUpdate: createSelector('data-testid links-levels-update'),
};

/**
 * Mock Link Editor
 */
const LinkEditorMock = ({ value, onChange }: any) => {
  return (
    <input
      {...inTestIds.linkEditor.apply()}
      onChange={() => {
        onChange(value);
      }}
    />
  );
};

/**
 * Mock Link Editor
 */
jest.mock('./components', () => ({
  LinkEditor: jest.fn(),
}));

describe('ColumnsEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.groupEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Default
   */
  const defaultDropdowns = [{ name: 'Dropdown1', items: [] }];
  const defaultOptionId = 'groups';

  const link1 = createLinkConfig({ name: 'Link1' });
  const link2 = createLinkConfig({ name: 'Link2' });

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
  const getComponent = (props: Partial<Props>) => (
    <GroupEditor
      name="Default"
      dashboards={dashboardsMock}
      dropdowns={defaultDropdowns}
      optionId={defaultOptionId}
      {...(props as any)}
    />
  );

  beforeEach(() => {
    jest.mocked(LinkEditor).mockImplementation(LinkEditorMock);
  });

  it('Should render items', () => {
    render(
      getComponent({
        value: [link1, link2],
      })
    );

    expect(selectors.itemHeader(false, link1.name)).toBeInTheDocument();
    expect(selectors.itemHeader(false, link2.name)).toBeInTheDocument();
  });

  it('Should render if no items', () => {
    render(
      getComponent({
        value: [],
      })
    );

    expect(selectors.itemHeader(true, 'Link 1')).not.toBeInTheDocument();
    expect(selectors.itemHeader(true, 'Link 2')).not.toBeInTheDocument();

    expect(selectors.newItem()).toBeInTheDocument();
  });

  it('Should add new item', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        value: [link1, link2],
        onChange,
      })
    );

    await act(() => fireEvent.change(selectors.newItemName(), { target: { value: 'Link3' } }));

    expect(selectors.buttonAddNew()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).not.toBeDisabled();

    await act(() => fireEvent.click(selectors.buttonAddNew()));

    expect(onChange).toHaveBeenCalledWith([
      link1,
      link2,
      createLinkConfig({
        name: 'Link3',
        tags: [],
        showMenuOnHover: false,
      }),
    ]);
  });

  describe('Rename', () => {
    it('Should save new Link name', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          value: [link1, link2],
          onChange,
        })
      );

      const item1 = selectors.itemHeader(false, link1.name);
      const item1Selectors = getSelectors(within(item1));
      const item2 = selectors.itemHeader(false, link2.name);
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
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: link1.name }),
          expect.objectContaining({ name: 'hello' }),
        ])
      );
    });

    it('Should cancel renaming', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          value: [link1, link2],
          onChange,
        })
      );
      const item = selectors.itemHeader(false, link2.name);
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

      render(
        getComponent({
          value: [link1, link2],
          onChange,
        })
      );

      const item = selectors.itemHeader(false, link1.name);
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
      fireEvent.change(itemSelectors.fieldName(), { target: { value: link2.name } });

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

      render(
        getComponent({
          value: [link1, link2],
          onChange,
        })
      );

      const item = selectors.itemHeader(false, link2.name);
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
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: link1.name }),
          expect.objectContaining({ name: 'hello' }),
        ])
      );
    });

    it('Should cancel renaming by escape', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          value: [link1, link2],
          onChange,
        })
      );

      const item = selectors.itemHeader(false, link1.name);
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
  });

  it('Should remove item', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        value: [link1, link2],
        onChange,
      })
    );

    const field2 = selectors.itemHeader(false, link1.name);

    /**
     * Check field presence
     */
    expect(field2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(getSelectors(within(field2)).buttonRemove()));

    expect(onChange).toHaveBeenCalledWith([link2]);
  });

  it('Should hide item', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        value: [link1, link2],
        onChange,
      })
    );

    const field = selectors.itemHeader(false, link1.name);

    /**
     * Check field presence
     */
    expect(field).toBeInTheDocument();

    /**
     * Hide
     */
    await act(() => fireEvent.click(getSelectors(within(field)).buttonToggleVisibility()));

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: link1.name, enable: false }),
        expect.objectContaining({ name: link2.name }),
      ])
    );
  });

  it('Should show item', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        value: [
          {
            ...link1,
            enable: false,
          },
          link2,
        ],
        onChange,
      })
    );

    const field = selectors.itemHeader(false, link1.name);

    /**
     * Check field presence
     */
    expect(field).toBeInTheDocument();

    /**
     * Show
     */
    await act(() => fireEvent.click(getSelectors(within(field)).buttonToggleVisibility()));

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: link1.name, enable: true }),
        expect.objectContaining({ name: link2.name }),
      ])
    );
  });

  it('Should reorder items', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });

    const onChange = jest.fn();

    render(
      getComponent({
        value: [
          {
            ...link1,
            enable: true,
          },
          link2,
        ],
        onChange,
      })
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

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: link2.name }),
        expect.objectContaining({ name: link1.name }),
      ])
    );
  });

  it('Should not reorder items if drop outside the list', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });

    const onChange = jest.fn();

    render(
      getComponent({
        value: [link1, link2],
        onChange,
      })
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

  it('Should expand item content', () => {
    const onChange = jest.fn();

    render(
      getComponent({
        value: [link1, link2],
        onChange,
      })
    );

    expect(selectors.itemHeader(false, link1.name)).toBeInTheDocument();
    expect(selectors.itemContent(true, link1.name)).not.toBeInTheDocument();

    /**
     * Expand
     */
    fireEvent.click(selectors.itemHeader(false, link1.name));

    expect(selectors.itemContent(false, link1.name)).toBeInTheDocument();
  });

  it('Should allow to change item', () => {
    /**
     * Value for test
     */
    const tagsMock = ['tag', 'oldTag'];

    /**
     * LinkEditor mock
     */
    jest.mocked(LinkEditor).mockImplementation(({ value, onChange }) => {
      return (
        <div {...inTestIds.linkEditor.apply()}>
          <button
            {...inTestIds.buttonLevelsUpdate.apply()}
            onClick={() => {
              /**
               * Simulate link change
               */
              onChange({ ...value, tags: tagsMock });
            }}
          />
        </div>
      );
    });

    const onChange = jest.fn();

    render(
      getComponent({
        value: [link1, link2],
        onChange,
      })
    );

    /**
     * Expand
     */
    fireEvent.click(selectors.itemHeader(false, link1.name));

    expect(selectors.linkEditor()).toBeInTheDocument();

    /**
     * Simulate change
     */
    fireEvent.click(selectors.buttonLevelsUpdate());

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: link1.name, tags: tagsMock }),
        expect.objectContaining({ name: link2.name }),
      ])
    );
  });
});
