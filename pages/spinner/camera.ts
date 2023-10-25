import { ArcRotateCamera, Scene, Vector3 } from '@babylonjs/core';

export const setupCamera = (scene: Scene) => {
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    -Math.PI,
    15,
    Vector3.Zero(),
    scene,
  );
  camera.target = Vector3.Zero();
  camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
  return camera;
};
