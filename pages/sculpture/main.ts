import {
  ArcRotateCamera,
  Engine,
  PBRMaterial,
  Scene,
  SceneLoader,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import sculpturePath from './sculpture.glb';

const rootUrl = sculpturePath.split('/');
const sceneFile = rootUrl.pop();

const main = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera(
    'camera',
    2.24,
    1.68,
    7,
    Vector3.Zero(),
    scene,
  );
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  engine.displayLoadingUI();

  SceneLoader.ImportMesh(
    '',
    rootUrl.join('/') + '/',
    sceneFile,
    scene,
    function () {
      const [headMaterial, eyeMaterial] = scene.materials as PBRMaterial[];
      headMaterial.metallic = 1;
      headMaterial.roughness = 0.3;
      eyeMaterial.metallic = 1;
      eyeMaterial.roughness = 0;
      eyeMaterial.clearCoat.isEnabled = true;
      eyeMaterial.clearCoat.indexOfRefraction = 3;
      eyeMaterial.sheen.isEnabled = true;
      scene.createDefaultEnvironment();
      engine.hideLoadingUI();
    },
  );

  engine.runRenderLoop(() => {
    scene.render();
    engine.resize();
  });
};

main();
