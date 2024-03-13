import { CreateGround, Scene } from '@babylonjs/core';

export const createGround = (scene: Scene) => {
  const ground = CreateGround(
    'ground',
    {
      width: 100,
      height: 100,
      subdivisions: 100,
      updatable: true,
    },
    scene,
  );

  return ground;
};
