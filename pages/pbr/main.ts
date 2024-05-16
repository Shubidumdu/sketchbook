import './style.scss';
import {
  ArcRotateCamera,
  CubeTexture,
  Effect,
  Engine,
  PointLight,
  Scene,
  ShaderMaterial,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { importMeshes } from '../../utils/babylon';
import modelPath from './tricanaOfCoimbra.glb';
import environmentPath from './environment.env';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';
import pbrVertexShader from './shaders/pbr.vertex.glsl?raw';
import pbrFragmentShader from './shaders/pbr.fragment.glsl?raw';

const metallicInput = document.getElementById('metallic') as HTMLInputElement;
const roughnessInput = document.getElementById('roughness') as HTMLInputElement;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);

engine.displayLoadingUI();

const scene = new Scene(engine);
const envTexture = CubeTexture.CreateFromPrefilteredData(
  environmentPath,
  scene,
);

scene.createDefaultSkybox(envTexture);

Effect.ShadersStore['pbrVertexShader'] = pbrVertexShader;
Effect.ShadersStore['pbrFragmentShader'] = pbrFragmentShader;

const lights = [
  new PointLight('light', new Vector3(4, 5, -1)),
  new PointLight('light', new Vector3(5, 12, -1)),
  new PointLight('light', new Vector3(-4, -6, 4)),
  new PointLight('light', new Vector3(2, 8, -10)),
];

const lightColors = [
  [0.6, 0.1, 0.1],
  [0.1, 0.6, 0.9],
  [1, 1, 1],
  [1, 1, 1],
]
  .flat()
  .map((n) => n * 0);

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
  camera.maxZ = 1000;
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  const [root, ...restMeshes] = await importMeshes(modelPath);
  const customMaterial = makeShaderMaterial();

  customMaterial.setArray3(
    'sphericalHarmonics',
    [
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l00,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l1_1,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l10,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l11,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l2_2,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l2_1,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l20,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l21,
      envTexture.sphericalPolynomial?.preScaledHarmonics?.l22,
    ].flatMap(({ x, y, z }: any) => [x, y, z]),
  );

  restMeshes.forEach((mesh) => {
    mesh.material = customMaterial;
    mesh.setParent(null);
  });
  root.dispose();

  engine.hideLoadingUI();

  customMaterial.setTexture('brdfLUT', scene.environmentBRDFTexture);
  customMaterial.setTexture('environmentMap', envTexture);

  engine.runRenderLoop(() => {
    customMaterial.setArray3(
      'lightPositions',
      lights
        .map((light) => [light.position.x, light.position.y, light.position.z])
        .flat(),
    );
    customMaterial.setArray3('lightColors', lightColors);
    customMaterial.setVector3('cameraPosition', camera.position);
    customMaterial.setFloat('metallic', Number(metallicInput.value));
    customMaterial.setFloat('roughness', Number(roughnessInput.value));
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
