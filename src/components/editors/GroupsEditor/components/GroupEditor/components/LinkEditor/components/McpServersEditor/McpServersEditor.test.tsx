import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { McpServerConfig } from '@/types';

import { McpServersEditor } from './McpServersEditor';

type Props = React.ComponentProps<typeof McpServersEditor>;

describe('McpServersEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.mcpServersEditor);
  const selectors = getSelectors(screen);

  /**
   * Mock data
   */
  const defaultServers: McpServerConfig[] = [
    {
      name: 'Test Server 1',
      url: 'http://localhost:3004',
      enabled: true,
    },
    {
      name: 'Test Server 2',
      url: 'http://localhost:3005',
      enabled: false,
    },
  ];

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <McpServersEditor onChange={onChange} value={defaultServers} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render without crashing', () => {
    render(getComponent({ value: undefined }));
    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.newItemName()).toBeInTheDocument();
    expect(selectors.newItemUrl()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).toBeInTheDocument();
  });

  it('Should display server information correctly', () => {
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.newItem()).toBeInTheDocument();
  });

  it('Should allow adding a new server', async () => {
    render(getComponent({}));

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'New Server' } });
    fireEvent.change(urlInput, { target: { value: 'http://localhost:3006' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([
        ...defaultServers,
        {
          name: 'New Server',
          url: 'http://localhost:3006',
          enabled: true,
        },
      ]);
    });
  });

  it('Should validate server name uniqueness', () => {
    render(getComponent({}));

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'Test Server 1' } });
    fireEvent.change(urlInput, { target: { value: 'http://localhost:3006' } });

    expect(addButton).toBeDisabled();
  });

  it('Should validate URL format', () => {
    render(getComponent({}));

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'New Server' } });
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });

    expect(addButton).toBeDisabled();
  });

  it('Should allow toggling server enabled state', () => {
    render(getComponent({}));

    const toggleButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonToggleEnabled.selector());
    const secondToggle = toggleButtons[1];

    fireEvent.click(secondToggle);

    expect(onChange).toHaveBeenCalledWith([
      defaultServers[0],
      {
        ...defaultServers[1],
        enabled: true,
      },
    ]);
  });

  it('Should allow removing a server', () => {
    render(getComponent({}));

    const removeButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonRemove.selector());
    const firstRemoveButton = removeButtons[0];

    fireEvent.click(firstRemoveButton);

    expect(onChange).toHaveBeenCalledWith([defaultServers[1]]);
  });

  it('Should handle empty server list', () => {
    render(getComponent({}));

    expect(selectors.newItemName()).toBeInTheDocument();
    expect(selectors.newItemUrl()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).toBeInTheDocument();
  });

  it('Should prevent adding server with empty name', () => {
    render(getComponent({}));

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(urlInput, { target: { value: 'http://localhost:3006' } });

    expect(addButton).toBeDisabled();
  });

  it('Should prevent adding server with empty URL', () => {
    render(getComponent({}));

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'New Server' } });
    fireEvent.change(urlInput, { target: { value: '' } });

    expect(addButton).toBeDisabled();
  });

  it('Should allow editing server name and URL', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();
    const saveButton = selectors.buttonSaveRename();
    const cancelButton = selectors.buttonCancelRename();

    expect(nameField).toBeInTheDocument();
    expect(urlField).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });
    fireEvent.click(saveButton);

    expect(onChange).toHaveBeenCalledWith([
      {
        ...defaultServers[0],
        name: 'Updated Server Name',
        url: 'http://localhost:3007',
      },
      defaultServers[1],
    ]);
  });

  it('Should validate edited server name uniqueness', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();
    const saveButton = selectors.buttonSaveRename();

    fireEvent.change(nameField, { target: { value: 'Test Server 2' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    expect(saveButton).toBeDisabled();
  });

  it('Should validate edited URL format', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();
    const saveButton = selectors.buttonSaveRename();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'invalid-url' } });

    expect(saveButton).toBeDisabled();
  });

  it('Should handle Enter key in name field during edit mode', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(nameField, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith([
      {
        ...defaultServers[0],
        name: 'Updated Server Name',
        url: 'http://localhost:3007',
      },
      defaultServers[1],
    ]);
  });

  it('Should handle Escape key in name field during edit mode', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(nameField, { key: 'Escape' });

    expect(onChange).not.toHaveBeenCalled();

    expect(nameField).not.toBeInTheDocument();
  });

  it('Should handle Enter key in URL field during edit mode', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(urlField, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith([
      {
        ...defaultServers[0],
        name: 'Updated Server Name',
        url: 'http://localhost:3007',
      },
      defaultServers[1],
    ]);
  });

  it('Should handle Escape key in URL field during edit mode', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(urlField, { key: 'Escape' });

    expect(onChange).not.toHaveBeenCalled();

    expect(urlField).not.toBeInTheDocument();
  });

  it('Should not save on Enter key when validation fails in name field', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: '' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(nameField, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('Should not save on Enter key when validation fails in URL field', () => {
    render(getComponent({}));

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'invalid-url' } });

    fireEvent.keyDown(urlField, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('Should reorder items', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};

    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });

    const onChange = jest.fn();

    await act(async () => render(getComponent({ onChange: onChange })));

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

    expect(onChange).toHaveBeenCalledWith([defaultServers[1], defaultServers[0]]);
  });

  it('Should not reorder items if drop outside the list', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};

    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });

    const onChange = jest.fn();

    await act(async () => render(getComponent({ onChange: onChange })));

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
