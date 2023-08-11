import { Color3, Color4, Vector2, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import { hexToRgb } from '../../utils/color';
import {
  createCamera,
  createGround,
  createLight,
  createPostProcess,
  createShadowGenerator,
  importMeshes,
} from './nodes';
import { canvas, engine, scene } from './scene';
import {
  groundMaterial,
  groundShadowMaterial,
  oneBitShaderMaterial,
} from './materials';

engine.displayLoadingUI();

const [mainColor, subColor] =
  document.querySelectorAll<HTMLInputElement>('input');

const main = async () => {
  createGround();
  const light = createLight();
  const camera = createCamera();
  const shadowGenerator = createShadowGenerator(light);
  const depthRenderer = scene.enableDepthRenderer();
  const postProcess = createPostProcess(camera);

  const meshes = await importMeshes();
  meshes.forEach((mesh) => {
    mesh.material = oneBitShaderMaterial;
    shadowGenerator.addShadowCaster(mesh);
  });
  engine.hideLoadingUI();

  postProcess.onApply = function (effect) {
    const subColorRgb = hexToRgb(subColor.value, true);
    effect.setVector2('screenSize', new Vector2(canvas.width, canvas.height));
    effect.setFloat('depthThreshold', 0.2);
    effect.setTexture('depthSampler', depthRenderer.getDepthMap());
    effect.setVector3('outlineColor', new Vector3(...subColorRgb));
  };

  engine.runRenderLoop(() => {
    const dpr = window.devicePixelRatio;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    const mainColorRgb = hexToRgb(mainColor.value, true);
    const subColorRgb = hexToRgb(subColor.value, true);

    scene.clearColor = new Color4(...mainColorRgb, 1);
    oneBitShaderMaterial.setVector3(
      'reverseLightDirection',
      light.position.normalizeToNew(),
    );
    oneBitShaderMaterial.setVector3('mainColor', new Vector3(...mainColorRgb));
    oneBitShaderMaterial.setVector3('subColor', new Vector3(...subColorRgb));
    groundMaterial.setVector3('mainColor', new Vector3(...mainColorRgb));
    groundMaterial.setVector3('subColor', new Vector3(...subColorRgb));
    groundShadowMaterial.shadowColor = new Color3(...subColorRgb);

    scene.render();
  });
};

main();
