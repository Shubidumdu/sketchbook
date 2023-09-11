import { ArcRotateCamera, SceneLoader, Vector3 } from '@babylonjs/core';
import { canvas, scene } from './scene';
import meshesPath from './meshes.glb';

export const createCamera = () => {
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    Math.PI / 2,
    4,
    Vector3.Zero(),
    scene,
  );
  camera.minZ = 0;
  camera.maxZ = 10;
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  return camera;
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
