import { sceneGraph, SceneObject, SceneObjectState } from '@grafana/scenes';
import { useCallback, useMemo } from 'react';

import { AnnotationDataLayer } from '@/types';

/**
 * useAnnotations hook
 * retrieve annotations in scene dashboards
 */
export const useAnnotations = () => {
  const sceneModel = window.__grafanaSceneContext as SceneObject<SceneObjectState>;

  const getAnnotations = useCallback((): AnnotationDataLayer[] => {
    return sceneGraph.getDataLayers(sceneModel) as unknown as AnnotationDataLayer[];
  }, [sceneModel]);

  const layers = useMemo(() => getAnnotations(), [getAnnotations]);
  const annotationsLayers = layers.flatMap((layer) => {
    return layer.state.annotationLayers;
  });

  return annotationsLayers;
};
