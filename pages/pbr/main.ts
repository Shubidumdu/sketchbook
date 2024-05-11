import './style.scss';
import {
  ArcRotateCamera,
  Effect,
  Engine,
  Light,
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

const lights = [
  new PointLight('light', new Vector3(4, 5, -1)),
  new PointLight('light', new Vector3(5, 12, -1)),
  new PointLight('light', new Vector3(-4, -6, 4)),
];

const init = async () => {
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

  restMeshes.forEach((mesh) => {
    mesh.material = customMaterial;
    mesh.setParent(null);
  });
  root.dispose();

  engine.hideLoadingUI();

  engine.runRenderLoop(() => {
    customMaterial.setArray3(
      'lightPositions',
      lights
        .map((light) => [light.position.x, light.position.y, light.position.z])
        .flat(),
    );
    customMaterial.setVector3('cameraPosition', camera.position);
    resizeCanvasToDisplaySize(canvas);
    scene.render();
  });
};

const makeShaderMaterial = () => {
  const material = new ShaderMaterial('customPbrShader', scene, 'pbr', {
    attributes: ['position', 'normal', 'color'],
    uniforms: ['world', 'view', 'worldView', 'worldViewProjection'],
  });

  return material;
};

init();

Inspector.Show(scene, {});
