import './style.scss';
import { ArcRotateCamera, Engine, Scene, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { importMeshes } from '../../utils/babylon';
import modelPath from './tricanaOfCoimbra.glb';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

engine.displayLoadingUI();

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
  const meshes = await importMeshes(modelPath);
  console.log(meshes);

  engine.hideLoadingUI();

  engine.runRenderLoop(() => {
    resizeCanvasToDisplaySize(canvas);
    scene.render();
  });
};

init();
