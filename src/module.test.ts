import { PanelPlugin } from '@grafana/data';

import { PanelOptions } from '@/types';
import { createGroupConfig } from '@/utils';

import { plugin } from './module';

/*
 Plugin
 */
describe('plugin', () => {
  /**
   * Builder
   */
  const builder: any = {
    addColorPicker: jest.fn(),
    addCustomEditor: jest.fn(),
    addRadio: jest.fn(),
    addSelect: jest.fn(),
    addSliderInput: jest.fn(),
    addTextInput: jest.fn(),
    addMultiSelect: jest.fn(),
    addBooleanSwitch: jest.fn(),
  };

  const addFieldMock = () => builder;

  beforeEach(() => {
    builder.addColorPicker.mockImplementation(addFieldMock);
    builder.addCustomEditor.mockImplementation(addFieldMock);
    builder.addRadio.mockImplementation(addFieldMock);
    builder.addSelect.mockImplementation(addFieldMock);
    builder.addSliderInput.mockImplementation(addFieldMock);
    builder.addTextInput.mockImplementation(addFieldMock);
    builder.addMultiSelect.mockImplementation(addFieldMock);
    builder.addBooleanSwitch.mockImplementation(addFieldMock);
  });

  it('Should be instance of PanelPlugin', () => {
    expect(plugin).toBeInstanceOf(PanelPlugin);
  });

  it('Should add editors', () => {
    /**
     * Supplier
     */
    plugin['optionsSupplier'](builder);

    /**
     * Inputs
     */
    expect(builder.addCustomEditor).toHaveBeenCalled();
  });

  describe('Visibility', () => {
    /**
     * Add Input Implementation
     * @param config
     * @param result
     */
    const addInputImplementation = (config: Partial<PanelOptions>, result: string[]) => (input: any) => {
      if (input.showIf) {
        if (input.showIf(config)) {
          result.push(input.path);
        }
      } else {
        result.push(input.path);
      }
      return builder;
    };

    it('Should show groupsSorting options', () => {
      const shownOptionsPaths: string[] = [];

      builder.addBooleanSwitch.mockImplementation(
        addInputImplementation(
          {
            groups: [createGroupConfig({ name: 'Group1' }), createGroupConfig({ name: 'Group2' })],
          },
          shownOptionsPaths
        )
      );

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining(['groupsSorting']));
    });

    it('Should not show groupsSorting options for one group', () => {
      const shownOptionsPaths: string[] = [];

      builder.addBooleanSwitch.mockImplementation(
        addInputImplementation(
          {
            groups: [createGroupConfig({ name: 'Group1' })],
          },
          shownOptionsPaths
        )
      );

      plugin['optionsSupplier'](builder);

      expect(shownOptionsPaths).toEqual(expect.arrayContaining([]));
    });
  });
});
