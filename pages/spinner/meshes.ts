import {
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
} from '@babylonjs/core';
import spinnerPath from './spinner.glb';

const rootUrl = spinnerPath.split('/');
const sceneFile = rootUrl.pop();

export const loadModel = async (scene: Scene) => {
  const result = await SceneLoader.ImportMeshAsync(
    'Spinner',
    rootUrl.join('/') + '/',
    sceneFile,
    scene,
  );

  const [root] = result.meshes;
  const [spinner] = root.getChildren() as Mesh[];
  spinner.parent = null;

  root.dispose();

  spinner.rotationQuaternion = null;

  return {
    spinner,
    cylinder: setupClickableCylinder(scene),
  };
};

const setupClickableCylinder = (scene: Scene) => {
  const cylinder = MeshBuilder.CreateCylinder('ClickableCylinder', {
    diameter: 9.5,
    height: 1.2,
    tessellation: 32,
  });
  const material = new StandardMaterial('ClickableMaterial', scene);
  material.alpha = 0;
  cylinder.material = material;
  return cylinder;
};
