import { Color4, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import { hexToRgb } from '../../utils/color';
import { createCamera, importMeshes } from './nodes';
import { canvas, engine, scene } from './scene';
import { goochShaderMaterial } from './materials';

engine.displayLoadingUI();

const [coolColor, warmColor, surfaceColor, highlightColor] =
  document.querySelectorAll<HTMLInputElement>('input');

const LIGHT_POSITION = [-4, 4, 8];
const LIGHT_COLOR = [0.9, 0.5, 0.9];

const main = async () => {
  const camera = createCamera();

  const meshes = await importMeshes();
  meshes.forEach((mesh) => {
    mesh.material = goochShaderMaterial;
  });
  engine.hideLoadingUI();

  goochShaderMaterial.setArray3('lightPosition', LIGHT_POSITION);
  goochShaderMaterial.setArray3('lightColor', LIGHT_COLOR);

  engine.runRenderLoop(() => {
    const dpr = window.devicePixelRatio;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    scene.clearColor = new Color4(1, 1, 1, 1);

    const coolColorRgb = hexToRgb(coolColor.value, true);
    const warmColorRgb = hexToRgb(warmColor.value, true);
    const surfaceColorRgb = hexToRgb(surfaceColor.value, true);
    const highlightColorRgb = hexToRgb(highlightColor.value, true);

    goochShaderMaterial.setVector3('coolColor', new Vector3(...coolColorRgb));
    goochShaderMaterial.setVector3('warmColor', new Vector3(...warmColorRgb));
    goochShaderMaterial.setVector3(
      'surfaceColor',
      new Vector3(...surfaceColorRgb),
    );
    goochShaderMaterial.setVector3(
      'highlightColor',
      new Vector3(...highlightColorRgb),
    );
    goochShaderMaterial.setVector3('cameraPosition', camera.position);

    scene.render();
  });
};

main();
