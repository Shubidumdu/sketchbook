interface HTMLCanvasElement {
  getContext(contextId: 'webgpu'): GPUCanvasContext | null;
}

declare var GPUBufferUsage: {
  prototype: GPUBufferUsage;
  readonly MAP_READ: GPUFlagsConstant;
  readonly MAP_WRITE: GPUFlagsConstant;
  readonly COPY_SRC: GPUFlagsConstant;
  readonly COPY_DST: GPUFlagsConstant;
  readonly INDEX: GPUFlagsConstant;
  readonly VERTEX: GPUFlagsConstant;
  readonly UNIFORM: GPUFlagsConstant;
  readonly STORAGE: GPUFlagsConstant;
  readonly INDIRECT: GPUFlagsConstant;
  readonly QUERY_RESOLVE: GPUFlagsConstant;
};

interface GPUMapMode {
  /**
   * Nominal type branding.
   * https://github.com/microsoft/TypeScript/pull/33038
   * @internal
   */
  readonly __brand: 'GPUMapMode';
  readonly READ: GPUFlagsConstant;
  readonly WRITE: GPUFlagsConstant;
}

declare var GPUMapMode: {
  prototype: GPUMapMode;
  new (): never;
  readonly READ: GPUFlagsConstant;
  readonly WRITE: GPUFlagsConstant;
};
