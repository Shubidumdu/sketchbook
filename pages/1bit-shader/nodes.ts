import {
  ArcRotateCamera,
  Camera,
  DirectionalLight,
  IShadowLight,
  MeshBuilder,
  PostProcess,
  SceneLoader,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';
import { canvas, scene } from './scene';
import { groundMaterial, groundShadowMaterial } from './materials';
import meshesPath from './meshes.glb';

export const createLight = () => {
  const light = new DirectionalLight(
    'light',
    new Vector3(0.3, -0.45, -0.1),
    scene,
  );
  light.shadowMaxZ = 80;
  light.shadowMinZ = -20;
  return light;
};

export const createCamera = () => {
  const camera = new ArcRotateCamera('camera', 1, 1, 10, Vector3.Zero(), scene);
  camera.minZ = 0;
  camera.maxZ = 30;
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  return camera;
};

export const createGround = () => {
  const groundShadow = MeshBuilder.CreateGround(
    'groundShadow',
    { width: 100, height: 100 },
    scene,
  );
  groundShadow.position.y = -1.438;
  groundShadow.material = groundShadowMaterial;
  groundShadow.receiveShadows = true;

  const ground = groundShadow.clone('ground');
  ground.position.y = -1.44;
  ground.material = groundMaterial;
};

export const createShadowGenerator = (light: IShadowLight) => {
  const shadowGenerator = new ShadowGenerator(1024, light, false);
  shadowGenerator.useExponentialShadowMap = true;
  shadowGenerator.setDarkness(0);
  return shadowGenerator;
};

const rootUrl = meshesPath.split('/');
const sceneFile = rootUrl.pop();

export const importMeshes = async () => {
  const { meshes } = await SceneLoader.ImportMeshAsync(
    '',
    rootUrl.join('/') + '/',
    sceneFile,
  );
  return meshes;
};

export const createPostProcess = (camera: Camera) => {
  const postProcess = new PostProcess(
    'Outline Postprocess',
    'outline',
    ['depthThreshold', 'screenSize', 'outlineColor'],
    ['depthSampler'],
    1,
    camera,
  );
  return postProcess;
};
