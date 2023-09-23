import './style.scss';
import {
  ArcRotateCamera,
  Effect,
  Engine,
  MeshBuilder,
  Scene,
  ShaderMaterial,
  Vector3,
} from '@babylonjs/core';
import cloudVertexShader from './shaders/cloud.vertex.glsl?raw';
import cloudFragmentShader from './shaders/cloud.fragment.glsl?raw';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';
import { rgbaToColor4 } from '../../utils/color';

Effect.ShadersStore['cloudVertexShader'] = cloudVertexShader;
Effect.ShadersStore['cloudFragmentShader'] = cloudFragmentShader;

const spherePositions = [
  new Vector3(-6, 0, 0),
  new Vector3(4, 2, -1),
  new Vector3(-4, 3, -4),
  new Vector3(-4, -1, 1),
  new Vector3(2, -3, -2),
  new Vector3(-3, -2, -3),
  new Vector3(5, 0, 1),
  new Vector3(-1, 2, 1),
  new Vector3(4, -1, -3),
];

let time = 0;

const createScene = () => {
  const canvas = document.querySelector('canvas')! as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = rgbaToColor4(232, 241, 251, 1);
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    Math.PI / 2,
    10,
    Vector3.Zero(),
    scene,
  );
  camera.attachControl(canvas, true);

  const material = new ShaderMaterial('cloudShader', scene, 'cloud', {
    attributes: ['position', 'normal'],
    uniforms: ['world', 'worldViewProjection', 'time'],
  });

  spherePositions.map((position) => createSphere(scene, material, position));

  engine.runRenderLoop(() => {
    resizeCanvasToDisplaySize(canvas);
    time += scene.deltaTime || 0;
    material.setFloat('time', time);
    scene.render();
  });
};

const createSphere = (
  scene: Scene,
  material: ShaderMaterial,
  position: Vector3,
) => {
  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
  sphere.setAbsolutePosition(position);
  sphere.material = material;
  sphere.rotate(new Vector3(1, 1, 1), Math.random() * Math.PI * 2);
  return sphere;
};

createScene();
