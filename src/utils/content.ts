import { DataFrame, formattedValueToString } from '@grafana/data';

/**
 * prepareContentData
 * @param panelData
 */
export const prepareContentData = (panelData: DataFrame[]) => {
  return panelData.map((frame) =>
    frame.fields.reduce(
      (acc, { config, name, values, display }) => {
        values.forEach((value, i) => {
          /**
           * Formatted Value
           */
          const formattedValue = display?.(value);

          /**
           * Set Value and Status Color
           */
          acc[i] = {
            ...acc[i],
            [config.displayName || name]:
              config.unit && formattedValue ? formattedValueToString(formattedValue) : value,
          };
        });

        return acc;
      },
      [] as Array<Record<string, unknown>>
    )
  );
};
