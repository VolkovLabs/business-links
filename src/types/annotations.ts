/**
 * Annotation Layer
 */
export interface AnnotationLayer {
  /**
   * State
   */
  state: {
    /**
     * name
     */
    name: string;

    /**
     * key - dynamically changed
     */
    key: string;

    /**
     * is annotation Enabled
     */
    isEnabled: boolean;

    /**
     * is annotation hidden
     */
    isHidden: boolean;
  };

  /**
   * Set current annotation state
   */
  setState: (state: unknown) => void;

  /**
   * Re run state for annotations
   */
  runLayer: () => void;
}

/**
 * Annotation DataLayer
 */
export interface AnnotationDataLayer {
  /**
   * State
   */
  state: {
    annotationLayers: AnnotationLayer[];
  };
}
