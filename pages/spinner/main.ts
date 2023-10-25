import '@babylonjs/loaders';
import './style.scss';
import { Color3, Color4, Engine, Scene } from '@babylonjs/core';
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
  scene.clearColor = Color4.FromHexString('#212E33');
  const { spinner } = await loadModel(scene);
  setupCamera(scene);
  setupMotionBlur(scene);
  setupEventHandlers(scene, state, spinner);
  const environment = scene.createDefaultEnvironment({
    createGround: true,
    createSkybox: false,
  });
  if (environment?.groundMaterial) {
    environment.groundMaterial.primaryColor = Color3.FromHexString('#637A82');
  }
  scene.createDefaultLight(true);
  engine.hideLoadingUI();

  engine.runRenderLoop(() => {
    const velocity = calcAngularVelocity(state.velocity, state.endPickTime);
    spinner.rotation.y += velocity;
    scene.render();
    engine.resize();
  });
};

main();
