import { cx } from '@emotion/css';
import { Button, Icon, IconButton, InlineField, InlineFieldRow, Input, useTheme2 } from '@grafana/ui';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from '@hello-pangea/dnd';
import React, { useCallback, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { McpServerConfig } from '@/types';
import { reorder } from '@/utils';

import { getStyles } from './McpServersEditor.styles';

/**
 * Properties
 */
interface Props {
  /**
   * MCP Servers
   */
  value: McpServerConfig[];

  /**
   * On change callback
   */
  onChange: (servers: McpServerConfig[]) => void;
}

/**
 * Get Item Style
 */
const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
  /**
   * styles we need to apply on draggables
   */
  ...draggableStyle,
});

/**
 * MCP Servers Editor
 */
export const McpServersEditor: React.FC<Props> = ({ value = [], onChange }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * States
   */
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [editItem, setEditItem] = useState('');
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');

  /**
   * Servers
   */
  const servers = useMemo(() => value, [value]);

  /**
   * Change Servers
   */
  const onChangeServers = useCallback(
    (newServers: McpServerConfig[]) => {
      onChange(newServers);
    },
    [onChange]
  );

  /**
   * Drag End
   */
  const onDragEnd = useCallback(
    (result: DropResult) => {
      /**
       * Dropped outside the list
       */
      if (!result.destination) {
        return;
      }

      onChangeServers(reorder(servers, result.source.index, result.destination.index));
    },
    [servers, onChangeServers]
  );

  /**
   * Check Updated Name
   */
  const isUpdatedNameValid = useMemo(() => {
    if (!editName.trim()) {
      return false;
    }

    if (editItem !== editName) {
      return !servers.some((server) => server.name === editName);
    }
    return true;
  }, [editItem, editName, servers]);

  /**
   * Check Updated URL
   */
  const isUpdatedUrlValid = useMemo(() => {
    if (!editUrl.trim()) {
      return false;
    }
    try {
      new URL(editUrl);
      return true;
    } catch {
      return false;
    }
  }, [editUrl]);

  /**
   * Is Name Exists error
   */
  const isNameExistsError = useMemo(() => {
    return servers.some((server) => server.name === newServerName);
  }, [servers, newServerName]);

  /**
   * Is URL Valid
   */
  const isUrlValid = useMemo(() => {
    if (!newServerUrl.trim()) {
      return false;
    }
    try {
      new URL(newServerUrl);
      return true;
    } catch {
      return false;
    }
  }, [newServerUrl]);

  /**
   * Add New Server
   */
  const onAddNewServer = useCallback(() => {
    onChangeServers([
      ...servers,
      {
        name: newServerName,
        url: newServerUrl,
        enabled: true,
      },
    ]);
    setNewServerName('');
    setNewServerUrl('');
  }, [servers, newServerName, newServerUrl, onChangeServers]);

  /**
   * On Cancel Edit
   */
  const onCancelEdit = useCallback(() => {
    setEditItem('');
    setEditName('');
    setEditUrl('');
  }, []);

  /**
   * On Save Name
   */
  const onSaveName = useCallback(() => {
    onChangeServers(
      servers.map((server) =>
        server.name === editItem
          ? {
              ...server,
              name: editName,
              url: editUrl,
            }
          : server
      )
    );
    onCancelEdit();
  }, [onChangeServers, servers, onCancelEdit, editItem, editName, editUrl]);

  return (
    <div {...TEST_IDS.mcpServersEditor.root.apply()}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="mcp-servers-editor">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {servers.map((server, index) => (
                <Draggable key={server.name} draggableId={server.name} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      className={styles.item}
                    >
                      <div className={styles.itemContent}>
                        {editItem === server.name ? (
                          <div
                            className={cx(styles.itemHeader, styles.itemHeaderForm)}
                            {...TEST_IDS.mcpServersEditor.itemHeader.apply(server.name)}
                          >
                            <InlineField className={styles.fieldName} invalid={!isUpdatedNameValid}>
                              <Input
                                autoFocus={true}
                                value={editName}
                                placeholder="Server name"
                                onChange={(event) => setEditName(event.currentTarget.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && isUpdatedNameValid && isUpdatedUrlValid) {
                                    onSaveName();
                                  }

                                  if (e.key === 'Escape') {
                                    onCancelEdit();
                                  }
                                }}
                                {...TEST_IDS.mcpServersEditor.fieldName.apply()}
                              />
                            </InlineField>
                            <InlineField className={styles.fieldUrl} invalid={!isUpdatedUrlValid}>
                              <Input
                                value={editUrl}
                                placeholder="Server URL (e.g., http://mcp-server)"
                                onChange={(event) => setEditUrl(event.currentTarget.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && isUpdatedNameValid && isUpdatedUrlValid) {
                                    onSaveName();
                                  }

                                  if (e.key === 'Escape') {
                                    onCancelEdit();
                                  }
                                }}
                                {...TEST_IDS.mcpServersEditor.fieldUrl.apply()}
                              />
                            </InlineField>
                            <Button
                              variant="secondary"
                              fill="text"
                              className={styles.actionButton}
                              icon="times"
                              size="sm"
                              onClick={onCancelEdit}
                              {...TEST_IDS.mcpServersEditor.buttonCancelRename.apply()}
                            />
                            <Button
                              variant="secondary"
                              fill="text"
                              className={styles.actionButton}
                              icon="save"
                              size="sm"
                              onClick={onSaveName}
                              disabled={!isUpdatedNameValid || !isUpdatedUrlValid}
                              tooltip={
                                !isUpdatedNameValid || !isUpdatedUrlValid
                                  ? 'Name is empty, URL is invalid, or server with the same name already exists.'
                                  : ''
                              }
                              {...TEST_IDS.mcpServersEditor.buttonSaveRename.apply()}
                            />
                          </div>
                        ) : (
                          <div
                            className={cx(styles.itemHeader, styles.itemHeaderText)}
                            {...TEST_IDS.mcpServersEditor.itemHeader.apply(server.name)}
                          >
                            <div className={styles.serverInfo}>
                              <span className={styles.serverName}>{server.name}</span>
                              <span className={styles.serverUrl}>{server.url}</span>
                            </div>
                            <div className={styles.serverActions}>
                              <Button
                                icon="edit"
                                variant="secondary"
                                fill="text"
                                size="sm"
                                className={styles.actionButton}
                                onClick={() => {
                                  setEditName(server.name);
                                  setEditUrl(server.url);
                                  setEditItem(server.name);
                                }}
                                {...TEST_IDS.mcpServersEditor.buttonEdit.apply()}
                              />
                              <IconButton
                                name={server.enabled ? 'eye' : 'eye-slash'}
                                aria-label={server.enabled ? 'Hide' : 'Show'}
                                onClick={() => {
                                  onChangeServers(
                                    servers.map((s) =>
                                      s.name === server.name
                                        ? {
                                            ...server,
                                            enabled: !server.enabled,
                                          }
                                        : s
                                    )
                                  );
                                }}
                                tooltip={server.enabled ? 'Hide' : 'Show'}
                                {...TEST_IDS.mcpServersEditor.buttonToggleEnabled.apply()}
                              />
                              <IconButton
                                name="trash-alt"
                                onClick={() => onChangeServers(servers.filter((s) => s.name !== server.name))}
                                aria-label="Remove"
                                {...TEST_IDS.mcpServersEditor.buttonRemove.apply()}
                              />
                              <div className={styles.dragHandle} {...provided.dragHandleProps}>
                                <Icon
                                  title="Drag and drop to reorder"
                                  name="draggabledots"
                                  size="lg"
                                  className={styles.dragIcon}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <InlineFieldRow {...TEST_IDS.mcpServersEditor.newItem.apply()}>
        <InlineField
          label="Server Name"
          grow={true}
          labelWidth={12}
          invalid={isNameExistsError}
          error="Server with the same name already exists."
        >
          <Input
            placeholder="Unique server name"
            value={newServerName}
            onChange={(event) => setNewServerName(event.currentTarget.value)}
            {...TEST_IDS.mcpServersEditor.newItemName.apply()}
          />
        </InlineField>
        <InlineField
          label="Server URL"
          grow={true}
          labelWidth={12}
          invalid={!isUrlValid && newServerUrl.length > 0}
          error="Please enter a valid URL"
        >
          <Input
            placeholder="http://mcp-server"
            value={newServerUrl}
            onChange={(event) => setNewServerUrl(event.currentTarget.value)}
            {...TEST_IDS.mcpServersEditor.newItemUrl.apply()}
          />
        </InlineField>
      </InlineFieldRow>
      <Button
        icon="plus"
        title="Add MCP Server"
        disabled={!newServerName || isNameExistsError || !isUrlValid}
        onClick={onAddNewServer}
        {...TEST_IDS.mcpServersEditor.buttonAddNew.apply()}
      >
        Add Server
      </Button>
    </div>
  );
};
