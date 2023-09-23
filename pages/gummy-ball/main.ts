import './style.scss';
import {
  ArcRotateCamera,
  Color4,
  Effect,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsRaycastResult,
  PointerEventTypes,
  Scene,
  ShaderMaterial,
  Vector3,
} from '@babylonjs/core';
import customVertexShader from './shaders/vertex.glsl?raw';
import customFragmentShader from './shaders/fragment.glsl?raw';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';

Effect.ShadersStore['customVertexShader'] = customVertexShader;
Effect.ShadersStore['customFragmentShader'] = customFragmentShader;

let time = 0;

const createScene = () => {
  const canvas = document.querySelector('canvas')! as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.8, 0.9, 1, 1);
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    Math.PI / 2,
    10,
    Vector3.Zero(),
    scene,
  );
  camera.attachControl(canvas, true);

  const material = new ShaderMaterial('customShader', scene, 'custom', {
    attributes: ['position', 'normal'],
    uniforms: [
      'world',
      'worldViewProjection',
      'time',
      'pointerRay',
      'clickedTime',
      'targetSize',
    ],
  });

  const spheres = [...new Array(5)].map(() => createSphere(scene, material));

  engine.runRenderLoop(() => {
    resizeCanvasToDisplaySize(canvas);
    time += scene.deltaTime || 0;
    material.setFloat('time', time);
    spheres.forEach((sphere) => {});
    scene.render();
  });
};

const createSphere = (scene: Scene, material: ShaderMaterial) => {
  const size = Math.random() * 2;
  const position = [Math.random() * 12 - 6, Math.random() * 8 - 4, 0];
  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
  // sphere.scaling = new Vector3(size, size, size);
  sphere.setAbsolutePosition(new Vector3(...position));
  sphere.material = material;
  sphere.rotate(new Vector3(1, 1, 1), Math.random() * Math.PI * 2);
  return sphere;
};

createScene();
