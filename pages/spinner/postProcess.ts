import { MotionBlurPostProcess, Scene } from '@babylonjs/core';

export const setupMotionBlur = (scene: Scene) => {
  const camera = scene.activeCamera;
  const motionBlur = new MotionBlurPostProcess(
    'motionBlur',
    scene,
    1.0,
    camera,
  );
  motionBlur.motionStrength = 0.1;
  return motionBlur;
};
