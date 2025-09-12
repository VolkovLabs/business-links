import { EventBus } from '@grafana/data';
import { RefreshEvent } from '@grafana/runtime';
import { sceneGraph, SceneObject, SceneObjectState } from '@grafana/scenes';
import { useCallback, useEffect, useState } from 'react';

import { AnnotationDataLayer, AnnotationLayer } from '@/types';

/**
 * useAnnotations hook
 * retrieve annotations in scene dashboards
 */
export const useAnnotations = ({ eventBus }: { eventBus?: EventBus }) => {
  const [annotationsLayers, setAnnotationsLayers] = useState<AnnotationLayer[]>([]);

  const loadAnnotations = useCallback(() => {
    try {
      const sceneModel = window.__grafanaSceneContext as SceneObject<SceneObjectState>;

      if (!sceneModel) {
        setAnnotationsLayers([]);
        return;
      }

      const layers = sceneGraph.getDataLayers(sceneModel) as unknown as AnnotationDataLayer[] | undefined;

      if (!layers || layers.length === 0) {
        setAnnotationsLayers([]);
        return;
      }

      const flattened = layers.flatMap((layer) => layer?.state?.annotationLayers ?? []);
      setAnnotationsLayers(flattened);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setAnnotationsLayers([]);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  /**
   * Load Annotations on Refresh
   */
  useEffect(() => {
    const subscriber = eventBus?.getStream(RefreshEvent).subscribe(() => {
      loadAnnotations();
    });

    return () => {
      subscriber?.unsubscribe();
    };
  }, [eventBus, loadAnnotations]);

  return annotationsLayers;
};
