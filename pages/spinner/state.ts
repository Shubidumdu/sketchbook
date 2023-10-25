import { Nullable, PickingInfo } from '@babylonjs/core';

export type State = {
  startPickInfo: Nullable<PickingInfo>;
  startPickTime: number;
  endPickTime: number;
  velocity: number;
  startAngle: number;
};

const state: State = {
  startPickInfo: null,
  startPickTime: 0,
  endPickTime: 0,
  velocity: 0,
  startAngle: 0,
};

export { state };
