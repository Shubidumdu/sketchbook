import { Color3 } from '@babylonjs/core';

export const rgbToColor3 = (r: number, g: number, b: number): Color3 => {
  return new Color3(...[r, g, b].map((c) => c / 255));
};
