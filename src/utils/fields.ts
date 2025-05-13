import { DataFrame, Field } from '@grafana/data';

import { FieldSource } from '@/types';

/**
 * Get Correct Field
 * @param frame
 * @param fieldSource
 */
export const getFieldFromFrame = (frame?: DataFrame, fieldSource?: FieldSource): Field | undefined => {
  return frame?.fields.find((field) => field.name === fieldSource?.name);
};

/**
 * Get frame by source
 * @param series
 * @param fieldSource
 */
export const getFrameBySource = (series: DataFrame[], fieldSource?: FieldSource): DataFrame | undefined => {
  if (!fieldSource) {
    return undefined;
  }

  if (typeof fieldSource.source === 'number') {
    return series[fieldSource.source];
  }

  return series.find((frame) => frame.refId === fieldSource.source);
};
