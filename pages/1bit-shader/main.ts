import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  Matrix,
  MeshBuilder,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import bitPath from  './1bit.glb';
import { ShaderMaterial } from "@babylonjs/core";
import { SimpleMaterial } from '@babylonjs/materials';
import { Inspector } from '@babylonjs/inspector';

const rootUrl = bitPath.split('/');
const sceneFile = rootUrl.pop();

const main = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const light = new DirectionalLight('light', new Vector3(2, -2, -4), scene);
  scene.clearColor = new Color4(0, 0, 0, 1);
  const camera = new ArcRotateCamera('camera', 1, 1, 10, Vector3.Zero(), scene);
  const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
  ground.position.y = -1.438;
  const groundMaterial = new SimpleMaterial('mat', scene);
  groundMaterial.diffuseColor = new Color3(1, 1, 1);
  ground.material = groundMaterial;
  ground.receiveShadows = true;

  const shadowGenerator = new ShadowGenerator(4096, light)
  shadowGenerator.useExponentialShadowMap = true;
  shadowGenerator.setDarkness(0);
  
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  engine.displayLoadingUI();

  const oneBitShaderMaterial = new ShaderMaterial("oneBitShader", scene, './1bit-shader', {
    attributes: ["position", "normal", "uv"],
    uniforms: [
      "world", "view", "worldViewProjection", "reverseLightDirection", "mainColor", "subColor"],
  });

  const targetMatrix = new Matrix();
  camera.getWorldMatrix().invertToRef(targetMatrix).transposeToRef(targetMatrix);

  oneBitShaderMaterial.setVector3("reverseLightDirection", light.position.normalizeToNew());
  oneBitShaderMaterial.setVector3("mainColor", new Vector3(1, 1, 1));
  oneBitShaderMaterial.setVector3("subColor", new Vector3(0, 0, 0));

  SceneLoader.ImportMesh(
    '',
    rootUrl.join('/') + '/',
    sceneFile,
    scene,
    function (meshes) {
      meshes.forEach((mesh) => {
        mesh.material = oneBitShaderMaterial;
        shadowGenerator.addShadowCaster(mesh);
        mesh.receiveShadows = true;
      });
      engine.hideLoadingUI();
    },
  );

  Inspector.Show(scene, {});

  engine.runRenderLoop(() => {
    scene.render();
    engine.resize();
  });
};  

main();
