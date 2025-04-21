import { cx } from '@emotion/css';
import { Button, Icon, IconButton, InlineField, InlineFieldRow, Input, useTheme2 } from '@grafana/ui';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from '@hello-pangea/dnd';
import { Collapse } from '@volkovlabs/components';
import React, { useCallback, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { DashboardMeta, EditorProps, LinkConfig, LinkConfigType, LinkTarget, LinkType } from '@/types';
import { reorder } from '@/utils';

import { LinkEditor } from './components';
import { getStyles } from './GroupEditor.styles';

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
 * Properties
 */
interface Props extends EditorProps<LinkConfig[]> {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Dashboards
   *
   * @type {DashboardMeta[]}
   */
  dashboards: DashboardMeta[];

  /**
   * Option id
   *
   * @type {string}
   */
  optionId?: string;

  /**
   * Available dropdowns
   *
   * @type {string[]}
   */
  dropdowns?: string[];
}

/**
 * Test Ids
 */
const testIds = TEST_IDS.groupEditor;

/**
 * Group Editor
 */
export const GroupEditor: React.FC<Props> = ({ value: items, name, onChange, dashboards, optionId, dropdowns }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * States
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newLinkName, setNewLinkName] = useState('');
  const [editItem, setEditItem] = useState('');
  const [editName, setEditName] = useState('');

  /**
   * Change Items
   */
  const onChangeItems = useCallback(
    (items: LinkConfig[]) => {
      onChange(items);
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

      onChangeItems(reorder(items, result.source.index, result.destination.index));
    },
    [items, onChangeItems]
  );

  /**
   * Check Updated Name
   */
  const isUpdatedNameValid = useMemo(() => {
    if (!editName.trim()) {
      return false;
    }

    if (editItem !== editName) {
      return !items.some((item) => item.name === editName);
    }
    return true;
  }, [editItem, editName, items]);

  /**
   * Is Name Exists error
   */
  const isNameExistsError = useMemo(() => {
    return items.some((item) => item.name === newLinkName);
  }, [items, newLinkName]);

  /**
   * Add New Link
   */
  const onAddNewItem = useCallback(() => {
    onChangeItems([
      ...items,
      {
        name: newLinkName,
        enable: true,
        type: LinkConfigType.LINK,
        linkType: LinkType.SINGLE,
        includeTimeRange: false,
        includeVariables: false,
        target: LinkTarget.SELF_TAB,
        tags: [],
        dashboardUrl: '',
        url: '',
        showMenuOnHover: false,
      },
    ]);
    setNewLinkName('');
  }, [items, newLinkName, onChangeItems]);

  /**
   * On Cancel Edit
   */
  const onCancelEdit = useCallback(() => {
    setEditItem('');
    setEditName('');
  }, []);

  /**
   * On Save Name
   */
  const onSaveName = useCallback(() => {
    onChangeItems(
      items.map((item) =>
        item.name === editItem
          ? {
              ...item,
              name: editName,
            }
          : item
      )
    );
    onCancelEdit();
  }, [onChangeItems, items, onCancelEdit, editItem, editName]);

  return (
    <div {...testIds.root.apply()}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={name}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.name} draggableId={item.name} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      className={styles.item}
                    >
                      <Collapse
                        headerTestId={testIds.itemHeader.selector(item.name)}
                        contentTestId={testIds.itemContent.selector(item.name)}
                        fill="solid"
                        title={
                          editItem === item.name ? (
                            <div
                              className={cx(styles.itemHeader, styles.itemHeaderForm)}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <InlineField className={styles.fieldName} invalid={!isUpdatedNameValid}>
                                <Input
                                  autoFocus={true}
                                  value={editName}
                                  onChange={(event) => setEditName(event.currentTarget.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && isUpdatedNameValid) {
                                      onSaveName();
                                    }

                                    if (e.key === 'Escape') {
                                      onCancelEdit();
                                    }
                                  }}
                                  {...testIds.fieldName.apply()}
                                />
                              </InlineField>
                              <Button
                                variant="secondary"
                                fill="text"
                                className={styles.actionButton}
                                icon="times"
                                size="sm"
                                onClick={onCancelEdit}
                                {...testIds.buttonCancelRename.apply()}
                              />
                              <Button
                                variant="secondary"
                                fill="text"
                                className={styles.actionButton}
                                icon="save"
                                size="sm"
                                onClick={onSaveName}
                                disabled={!isUpdatedNameValid}
                                tooltip={
                                  isUpdatedNameValid ? '' : 'Name is empty or group with the same name already exists.'
                                }
                                {...testIds.buttonSaveRename.apply()}
                              />
                            </div>
                          ) : (
                            <div className={cx(styles.itemHeader, styles.itemHeaderText)}>{item.name}</div>
                          )
                        }
                        actions={
                          <>
                            {editItem !== item.name && (
                              <Button
                                icon="edit"
                                variant="secondary"
                                fill="text"
                                size="sm"
                                className={styles.actionButton}
                                onClick={() => {
                                  /**
                                   * Start Edit
                                   */
                                  setEditName(item.name);
                                  setEditItem(item.name);
                                }}
                                {...testIds.buttonStartRename.apply()}
                              />
                            )}
                            <IconButton
                              name={item.enable ? 'eye' : 'eye-slash'}
                              aria-label={item.enable ? 'Hide' : 'Show'}
                              onClick={() => {
                                onChangeItems(
                                  items.map((link) =>
                                    link.name === item.name
                                      ? {
                                          ...item,
                                          enable: !item.enable,
                                        }
                                      : link
                                  )
                                );
                              }}
                              tooltip={item.enable ? 'Hide' : 'Show'}
                              {...testIds.buttonToggleVisibility.apply()}
                            />
                            <IconButton
                              name="trash-alt"
                              onClick={() => onChangeItems(items.filter((link) => link.name !== item.name))}
                              aria-label="Remove"
                              {...testIds.buttonRemove.apply()}
                            />
                            <div className={styles.dragHandle} {...provided.dragHandleProps}>
                              <Icon
                                title="Drag and drop to reorder"
                                name="draggabledots"
                                size="lg"
                                className={styles.dragIcon}
                              />
                            </div>
                          </>
                        }
                        isOpen={expanded[item.name]}
                        onToggle={(isOpen) =>
                          setExpanded({
                            ...expanded,
                            [item.name]: isOpen,
                          })
                        }
                      >
                        <LinkEditor
                          value={item}
                          onChange={(link) => {
                            onChangeItems(items.map((itemLink) => (itemLink.name === link.name ? link : itemLink)));
                          }}
                          optionId={optionId}
                          dropdowns={dropdowns}
                          dashboards={dashboards}
                        />
                      </Collapse>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <InlineFieldRow className={styles.newItem} {...testIds.newItem.apply()}>
        <InlineField
          label="New Link"
          grow={true}
          invalid={isNameExistsError}
          error="Group with the same name already exists."
        >
          <Input
            placeholder="Unique label name"
            value={newLinkName}
            onChange={(event) => setNewLinkName(event.currentTarget.value)}
            {...testIds.newItemName.apply()}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Link"
          disabled={!newLinkName || isNameExistsError}
          onClick={onAddNewItem}
          {...testIds.buttonAddNew.apply()}
        >
          Add Link
        </Button>
      </InlineFieldRow>
    </div>
  );
};
