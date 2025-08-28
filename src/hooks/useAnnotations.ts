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

  const testLayers = useMemo(() => getAnnotations(), [getAnnotations]);

  const annotationsLayers = testLayers.flatMap((layer) => {
    return layer.state.annotationLayers;
  });

  return annotationsLayers;
};
