import { act, renderHook } from '@testing-library/react';
import { useAnnotations } from './useAnnotations';
import { sceneGraph } from '@grafana/scenes';
import type { AnnotationDataLayer } from '@/types';
import { EventBusSrv } from '@grafana/data';
import { RefreshEvent } from '@grafana/runtime';

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
   * Event Bus
   */
  const eventBus = new EventBusSrv();

  /**
   * Before
   */
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).__grafanaSceneContext = { mock: true };
  });

  it('Should return, if dataLayers is empty', () => {
    (sceneGraph.getDataLayers as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useAnnotations({ eventBus: eventBus }));

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

    const { result } = renderHook(() => useAnnotations({ eventBus: eventBus }));

    expect(result.current).toEqual(fakeAnnotationLayers);
  });

  it('Should return empty if sceneModel is not defined', () => {
    (window as any).__grafanaSceneContext = undefined;

    const { result } = renderHook(() => useAnnotations({ eventBus }));

    expect(result.current).toEqual([]);
    expect(sceneGraph.getDataLayers).not.toHaveBeenCalled();
  });

  it('Should return empty if getDataLayers throws error', () => {
    (sceneGraph.getDataLayers as jest.Mock).mockImplementation(() => {
      throw new Error('boom');
    });

    const { result } = renderHook(() => useAnnotations({ eventBus }));

    expect(result.current).toEqual([]);
  });

  it('Should call load annotations on refresh event', async () => {
    (sceneGraph.getDataLayers as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useAnnotations({ eventBus: eventBus }));

    expect(result.current).toEqual([]);
    expect(sceneGraph.getDataLayers).toHaveBeenCalledWith((window as any).__grafanaSceneContext);
    expect(sceneGraph.getDataLayers).toHaveBeenCalledTimes(1);
    /**
     * Refresh
     */
    await act(async () => eventBus.publish(new RefreshEvent()));

    expect(sceneGraph.getDataLayers).toHaveBeenCalledTimes(2);
    expect(sceneGraph.getDataLayers).toHaveBeenCalledWith((window as any).__grafanaSceneContext);
  });
});
