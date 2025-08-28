import { renderHook } from '@testing-library/react';
import { useAnnotations } from './useAnnotations';
import { sceneGraph } from '@grafana/scenes';
import type { AnnotationDataLayer } from '@/types';

/**
 * Mock sceneGraph.
 */
jest.mock('@grafana/scenes', () => ({
  sceneGraph: {
    getDataLayers: jest.fn(),
  },
}));

describe('useAnnotations', () => {
  /**
   * Before
   */
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).__grafanaSceneContext = { mock: true };
  });

  it('Should return, if dataLayers is empty', () => {
    (sceneGraph.getDataLayers as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useAnnotations());

    expect(result.current).toEqual([]);
    expect(sceneGraph.getDataLayers).toHaveBeenCalledWith((window as any).__grafanaSceneContext);
  });

  it('Should return annotationLayers from dataLayers', () => {
    const fakeAnnotationLayers = [{ id: 'a1' }, { id: 'a2' }];
    const fakeDataLayers: AnnotationDataLayer[] = [
      {
        state: { annotationLayers: fakeAnnotationLayers },
      } as unknown as AnnotationDataLayer,
    ];

    (sceneGraph.getDataLayers as jest.Mock).mockReturnValue(fakeDataLayers);

    const { result } = renderHook(() => useAnnotations());

    expect(result.current).toEqual(fakeAnnotationLayers);
  });
});
