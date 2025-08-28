import { SceneObject } from '@grafana/scenes';

/**
 * __grafanaSceneContext contains Dashboard Scene Object if scene enabled
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __grafanaSceneContext?: SceneObject;
  }
}
