import {
  AbstractMesh,
  ArcRotateCamera,
  Engine,
  Mesh,
  Node,
  PickingInfo,
  Scene,
  SceneLoader,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import spinnerPath from './spinner.glb';
import { Inspector } from '@babylonjs/inspector';

const rootUrl = spinnerPath.split('/');
const sceneFile = rootUrl.pop();
const meshes = {} as { spinner: Mesh };
let startPickInfo: PickingInfo | null = null;
let startPickTime = 0;
let endPickTime = 0;
let velocity = 0;
let startAngle = 0;

const main = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  const handlePointerUp = () => {
    const point = scene.pick(scene.pointerX, scene.pointerY).pickedPoint;
    if (point && startPickInfo) {
      const _point = point.multiplyToRef(new Vector3(1, 0, 1), new Vector3());
      const _startPoint = startPickInfo.pickedPoint!.multiplyToRef(
        new Vector3(1, 0, 1),
        new Vector3(),
      );
      const distance = Vector3.Distance(_point, _startPoint);
      const cross = Vector3.Cross(_point, _startPoint);
      const direction = cross.y > 0 ? -1 : 1;
      const time = performance.now() - startPickTime;
      velocity = direction * (distance / time) * 100;
    }
    startPickInfo = null;
    camera.attachControl(canvas, true);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = () => {
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    const point = pickInfo.pickedPoint;
    if (point && startPickInfo) {
      const _point = point
        .multiplyToRef(new Vector3(1, 0, 1), new Vector3())
        .normalize();
      const _startPoint = startPickInfo
        .pickedPoint!.multiplyToRef(new Vector3(1, 0, 1), new Vector3())
        .normalize();
      const dot = Vector3.Dot(_point, _startPoint);
      const rad = Math.acos(dot);
      const cross = Vector3.Cross(_point, _startPoint);
      const angle = cross.y > 0 ? -rad : rad;
      meshes.spinner.rotation.y = startAngle + angle;
    }
  };

  const handlePointerDown = () => {
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    if (pickInfo.pickedMesh?.name) {
      if (!pickInfo.pickedMesh.name.includes('Background')) {
        camera.detachControl();
        startPickInfo = pickInfo;
        velocity = 0;
        startAngle = meshes.spinner.rotation.y;
        startPickTime = performance.now();
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
      }
    }
  };

  canvas.addEventListener('pointerdown', handlePointerDown);

  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    -Math.PI,
    15,
    Vector3.Zero(),
    scene,
  );
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  engine.displayLoadingUI();

  SceneLoader.ImportMesh(
    'Spinner',
    rootUrl.join('/') + '/',
    sceneFile,
    scene,
    ([root]) => {
      const [spinner] = root.getChildren();
      spinner.parent = null;
      root.dispose();
      meshes.spinner = spinner as Mesh;
      meshes.spinner.rotationQuaternion = null;
      scene.createDefaultEnvironment();
      engine.hideLoadingUI();
    },
  );

  engine.runRenderLoop(() => {
    scene.render();
    if (meshes.spinner) {
      meshes.spinner.rotation.y += angularVelocity(velocity, endPickTime);
    }
    engine.resize();
  });

  Inspector.Show(scene, {});
};

const angularVelocity = (initialVelocity: number, startTime: number) => {
  const decayConstant = 0.1;
  const time = (performance.now() - startTime) * 0.001;
  return initialVelocity * Math.exp(-decayConstant * time);
};

main();
