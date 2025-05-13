import { DataFrame, Field } from '@grafana/data';

import { FieldSource } from '@/types';

import { getFieldFromFrame, getFrameBySource } from './fields';

const mockField: Field = {
  name: 'testField',
  type: 'number' as any,
  config: {},
  values: [1, 2, 3],
};

const mockFrame: DataFrame = {
  fields: [mockField, { ...mockField, name: 'anotherField' }],
  length: 3,
  refId: 'A',
};

const mockSeries: DataFrame[] = [
  mockFrame,
  { ...mockFrame, refId: 'B', fields: [{ ...mockField, name: 'otherField' }] },
];

describe('getFieldFromFrame', () => {
  it('Should return undefined if frame is undefined', () => {
    const result = getFieldFromFrame(undefined, { name: 'testField', source: 'A' });
    expect(result).toBeUndefined();
  });

  it('Should return undefined if fieldSource is undefined', () => {
    const result = getFieldFromFrame(mockFrame, undefined);
    expect(result).toBeUndefined();
  });

  it('Should return the correct field by name', () => {
    const fieldSource: FieldSource = { name: 'testField', source: 'A' };
    const result = getFieldFromFrame(mockFrame, fieldSource);
    expect(result).toEqual(mockField);
    expect(result?.name).toEqual('testField');
  });

  it('Should return undefined if field name does not exist in frame', () => {
    const fieldSource: FieldSource = { name: 'nonExistentField', source: 'A' };
    const result = getFieldFromFrame(mockFrame, fieldSource);
    expect(result).toBeUndefined();
  });
});

describe('getFrameBySource', () => {
  it('Should return undefined if fieldSource is undefined', () => {
    const result = getFrameBySource(mockSeries, undefined);
    expect(result).toBeUndefined();
  });

  it('Should return the correct frame by index when source is a number', () => {
    const fieldSource: FieldSource = { name: 'testField', source: 0 };
    const result = getFrameBySource(mockSeries, fieldSource);
    expect(result).toEqual(mockSeries[0]);
    expect(result?.refId).toEqual('A');
  });

  it('Should return the correct frame by refId when source is a string', () => {
    const fieldSource: FieldSource = { name: 'testField', source: 'B' };
    const result = getFrameBySource(mockSeries, fieldSource);
    expect(result).toEqual(mockSeries[1]);
    expect(result?.refId).toEqual('B');
  });

  it('Should return undefined if frame is not found by refId', () => {
    const fieldSource: FieldSource = { name: 'testField', source: 'C' };
    const result = getFrameBySource(mockSeries, fieldSource);
    expect(result).toBeUndefined();
  });

  it('Should return undefined if series is empty', () => {
    const fieldSource: FieldSource = { name: 'testField', source: 'A' };
    const result = getFrameBySource([], fieldSource);
    expect(result).toBeUndefined();
  });

  it('Should handle out-of-bounds index gracefully', () => {
    const fieldSource: FieldSource = { name: 'testField', source: 10 };
    const result = getFrameBySource(mockSeries, fieldSource);
    expect(result).toBeUndefined();
  });
});
