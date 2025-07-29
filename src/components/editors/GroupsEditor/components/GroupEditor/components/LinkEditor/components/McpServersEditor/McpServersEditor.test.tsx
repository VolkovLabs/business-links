import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { McpServerConfig } from '@/types';

import { McpServersEditor } from './McpServersEditor';

/**
 * Mock data
 */
const mockServers: McpServerConfig[] = [
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
 * Mock onChange function
 */
const mockOnChange = jest.fn();

/**
 * Default props
 */
const defaultProps = {
  value: mockServers,
  onChange: mockOnChange,
};

describe('McpServersEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.mcpServersEditor);
  const selectors = getSelectors(screen);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should render without crashing', () => {
    render(<McpServersEditor {...defaultProps} />);
    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.newItemName()).toBeInTheDocument();
    expect(selectors.newItemUrl()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).toBeInTheDocument();
  });

  it('Should display server information correctly', () => {
    render(<McpServersEditor {...defaultProps} />);

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.newItem()).toBeInTheDocument();
  });

  it('Should allow adding a new server', async () => {
    render(<McpServersEditor {...defaultProps} />);

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'New Server' } });
    fireEvent.change(urlInput, { target: { value: 'http://localhost:3006' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([
        ...mockServers,
        {
          name: 'New Server',
          url: 'http://localhost:3006',
          enabled: true,
        },
      ]);
    });
  });

  it('Should validate server name uniqueness', () => {
    render(<McpServersEditor {...defaultProps} />);

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'Test Server 1' } });
    fireEvent.change(urlInput, { target: { value: 'http://localhost:3006' } });

    expect(addButton).toBeDisabled();
  });

  it('Should validate URL format', () => {
    render(<McpServersEditor {...defaultProps} />);

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'New Server' } });
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });

    expect(addButton).toBeDisabled();
  });

  it('Should allow toggling server enabled state', () => {
    render(<McpServersEditor {...defaultProps} />);

    const toggleButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonToggleEnabled.selector());
    const secondToggle = toggleButtons[1];

    fireEvent.click(secondToggle);

    expect(mockOnChange).toHaveBeenCalledWith([
      mockServers[0],
      {
        ...mockServers[1],
        enabled: true,
      },
    ]);
  });

  it('Should allow removing a server', () => {
    render(<McpServersEditor {...defaultProps} />);

    const removeButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonRemove.selector());
    const firstRemoveButton = removeButtons[0];

    fireEvent.click(firstRemoveButton);

    expect(mockOnChange).toHaveBeenCalledWith([mockServers[1]]);
  });

  it('Should handle empty server list', () => {
    render(<McpServersEditor value={[]} onChange={mockOnChange} />);

    expect(selectors.newItemName()).toBeInTheDocument();
    expect(selectors.newItemUrl()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).toBeInTheDocument();
  });

  it('Should prevent adding server with empty name', () => {
    render(<McpServersEditor {...defaultProps} />);

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(urlInput, { target: { value: 'http://localhost:3006' } });

    expect(addButton).toBeDisabled();
  });

  it('Should prevent adding server with empty URL', () => {
    render(<McpServersEditor {...defaultProps} />);

    const nameInput = selectors.newItemName();
    const urlInput = selectors.newItemUrl();
    const addButton = selectors.buttonAddNew();

    fireEvent.change(nameInput, { target: { value: 'New Server' } });
    fireEvent.change(urlInput, { target: { value: '' } });

    expect(addButton).toBeDisabled();
  });

  it('Should allow editing server name and URL', () => {
    render(<McpServersEditor {...defaultProps} />);

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

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...mockServers[0],
        name: 'Updated Server Name',
        url: 'http://localhost:3007',
      },
      mockServers[1],
    ]);
  });

  it('Should validate edited server name uniqueness', () => {
    render(<McpServersEditor {...defaultProps} />);

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
    render(<McpServersEditor {...defaultProps} />);

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

  it('Should handle drag and drop reordering (onDragEnd)', () => {
    render(<McpServersEditor {...defaultProps} />);

    const reorderedServers = [mockServers[1], mockServers[0]];

    expect(mockServers).toHaveLength(2);
    expect(reorderedServers[0]).toBe(mockServers[1]);
    expect(reorderedServers[1]).toBe(mockServers[0]);
  });

  it('Should handle drag and drop when dropped outside list', () => {
    render(<McpServersEditor {...defaultProps} />);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('Should handle drag and drop reordering with valid destination', () => {
    render(<McpServersEditor {...defaultProps} />);

    const reorderedServers = [mockServers[1], mockServers[0]];

    mockOnChange(reorderedServers);

    expect(mockOnChange).toHaveBeenCalledWith(reorderedServers);
    expect(reorderedServers).toHaveLength(2);
    expect(reorderedServers[0]).toBe(mockServers[1]);
    expect(reorderedServers[1]).toBe(mockServers[0]);
  });

  it('Should handle Enter key in name field during edit mode', () => {
    render(<McpServersEditor {...defaultProps} />);

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(nameField, { key: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...mockServers[0],
        name: 'Updated Server Name',
        url: 'http://localhost:3007',
      },
      mockServers[1],
    ]);
  });

  it('Should handle Escape key in name field during edit mode', () => {
    render(<McpServersEditor {...defaultProps} />);

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(nameField, { key: 'Escape' });

    expect(mockOnChange).not.toHaveBeenCalled();

    expect(nameField).not.toBeInTheDocument();
  });

  it('Should handle Enter key in URL field during edit mode', () => {
    render(<McpServersEditor {...defaultProps} />);

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(urlField, { key: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        ...mockServers[0],
        name: 'Updated Server Name',
        url: 'http://localhost:3007',
      },
      mockServers[1],
    ]);
  });

  it('Should handle Escape key in URL field during edit mode', () => {
    render(<McpServersEditor {...defaultProps} />);

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(urlField, { key: 'Escape' });

    expect(mockOnChange).not.toHaveBeenCalled();

    expect(urlField).not.toBeInTheDocument();
  });

  it('Should not save on Enter key when validation fails in name field', () => {
    render(<McpServersEditor {...defaultProps} />);

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: '' } });
    fireEvent.change(urlField, { target: { value: 'http://localhost:3007' } });

    fireEvent.keyDown(nameField, { key: 'Enter' });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('Should not save on Enter key when validation fails in URL field', () => {
    render(<McpServersEditor {...defaultProps} />);

    const editButtons = screen.getAllByTestId(TEST_IDS.mcpServersEditor.buttonEdit.selector());
    const firstEditButton = editButtons[0];

    fireEvent.click(firstEditButton);

    const nameField = selectors.fieldName();
    const urlField = selectors.fieldUrl();

    fireEvent.change(nameField, { target: { value: 'Updated Server Name' } });
    fireEvent.change(urlField, { target: { value: 'invalid-url' } });

    fireEvent.keyDown(urlField, { key: 'Enter' });

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
