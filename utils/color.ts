import { Color3 } from '@babylonjs/core';

export const rgbToColor3 = (r: number, g: number, b: number): Color3 => {
  return new Color3(...[r, g, b].map((c) => c / 255));
};

export const hexToRgb = (hex: string, normalize?: boolean): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (normalize) {
    return [r / 255, g / 255, b / 255];
  }
  
  return [r, g, b];
};
