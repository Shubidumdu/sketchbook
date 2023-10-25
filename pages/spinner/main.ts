import '@babylonjs/loaders';
import './style.scss';
import { Engine, Scene } from '@babylonjs/core';
import { setupCamera } from './camera';
import { loadModel } from './meshes';
import { setupEventHandlers } from './event';
import { state } from './state';
import { setupMotionBlur } from './postProcess';
import { calcAngularVelocity } from './util';

const main = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const { spinner } = await loadModel(scene);
  setupCamera(scene);
  setupMotionBlur(scene);
  setupEventHandlers(scene, state, spinner);
  scene.createDefaultEnvironment();
  engine.hideLoadingUI();

  engine.runRenderLoop(() => {
    const velocity = calcAngularVelocity(state.velocity, state.endPickTime);
    spinner.rotation.y += velocity;
    scene.render();
    engine.resize();
  });
};

main();
