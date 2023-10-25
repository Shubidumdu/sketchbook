import { Mesh, Scene, Vector3 } from '@babylonjs/core';
import { State } from './state';

export const setupEventHandlers = (
  scene: Scene,
  state: State,
  spinner: Mesh,
) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  const camera = scene.activeCamera;

  if (!canvas || !camera) {
    console.log('No canvas or camera');
    return;
  }

  const handlePointerUp = () => {
    const point = scene.pick(scene.pointerX, scene.pointerY).pickedPoint;
    if (point && state.startPickInfo) {
      const _point = point.multiplyToRef(new Vector3(1, 0, 1), new Vector3());
      const _startPoint = state.startPickInfo.pickedPoint!.multiplyToRef(
        new Vector3(1, 0, 1),
        new Vector3(),
      );
      const distance = Vector3.Distance(_point, _startPoint);
      const cross = Vector3.Cross(_point, _startPoint);
      const direction = cross.y > 0 ? -1 : 1;
      const time = performance.now() - state.startPickTime;
      state.velocity = direction * (distance / time) * 50;
    }
    state.startPickInfo = null;
    state.endPickTime = performance.now();
    camera.attachControl(canvas, true);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = () => {
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    const point = pickInfo.pickedPoint;
    if (point && state.startPickInfo) {
      const _point = point
        .multiplyToRef(new Vector3(1, 0, 1), new Vector3())
        .normalize();
      const _startPoint = state.startPickInfo
        .pickedPoint!.multiplyToRef(new Vector3(1, 0, 1), new Vector3())
        .normalize();
      const dot = Vector3.Dot(_point, _startPoint);
      const rad = Math.acos(dot);
      const cross = Vector3.Cross(_point, _startPoint);
      const angle = cross.y > 0 ? -rad : rad;
      spinner.rotation.y = state.startAngle + angle;
    }
  };

  const handlePointerDown = () => {
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    if (pickInfo.pickedMesh?.name) {
      if (!pickInfo.pickedMesh.name.includes('Background')) {
        camera.detachControl();
        state.startPickInfo = pickInfo;
        state.velocity = 0;
        state.startAngle = spinner.rotation.y;
        state.startPickTime = performance.now();
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
      }
    }
  };

  canvas.addEventListener('pointerdown', handlePointerDown);
};
