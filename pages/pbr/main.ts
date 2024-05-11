import './style.scss';
import {
  ArcRotateCamera,
  Effect,
  Engine,
  PBRMaterial,
  PointLight,
  Scene,
  ShaderMaterial,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { importMeshes } from '../../utils/babylon';
import modelPath from './tricanaOfCoimbra.glb';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';
import { Inspector } from '@babylonjs/inspector';
import { SimpleMaterial } from '@babylonjs/materials';
import pbrVertexShader from './shaders/pbr.vertex.glsl?raw';
import pbrFragmentShader from './shaders/pbr.fragment.glsl?raw';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

Effect.ShadersStore['pbrVertexShader'] = pbrVertexShader;
Effect.ShadersStore['pbrFragmentShader'] = pbrFragmentShader;

engine.displayLoadingUI();

const init = async () => {
  const light = new PointLight('light', new Vector3(50, 100, 0));
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    Math.PI / 2,
    50,
    Vector3.Zero(),
    scene,
  );
  camera.minZ = 0;
  camera.maxZ = 240;
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  const [root, ...restMeshes] = await importMeshes(modelPath);
  const customMaterial = makeShaderMaterial();
  customMaterial.setVector3(
    'reverseLightDirection',
    light.position.normalizeToNew(),
  );
  customMaterial.setVector3('mainColor', new Vector3(255, 255, 255));
  customMaterial.setVector3('subColor', new Vector3(0, 0, 0.24));

  restMeshes.forEach((mesh) => {
    mesh.material = customMaterial;
    mesh.setParent(null);
  });
  root.dispose();

  engine.hideLoadingUI();

  engine.runRenderLoop(() => {
    resizeCanvasToDisplaySize(canvas);
    scene.render();
  });
};

const makeShaderMaterial = () => {
  const material = new ShaderMaterial('customPbrShader', scene, 'pbr', {
    attributes: ['position', 'normal', 'uv', 'color'],
    uniforms: ['world', 'view', 'worldViewProjection'],
  });

  return material;
};

init();

// Inspector.Show(scene, {});
