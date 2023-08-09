import {
  ArcRotateCamera,
  Color4,
  Engine,
  Scene,
  SceneLoader,
  Vector2,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import bitPath from  './1bit.glb';
import { ShaderMaterial } from "@babylonjs/core";

const rootUrl = bitPath.split('/');
const sceneFile = rootUrl.pop();

const main = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1);
  const camera = new ArcRotateCamera('camera', 1, 1, 10, Vector3.Zero(), scene);
  
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  engine.displayLoadingUI();

  const oneBitShaderMaterial = new ShaderMaterial("oneBitShader", scene, './1bit-shader', {
    attributes: ["position", "normal", "uv"],
    uniforms: ["worldViewProjection", "reverseLightDirection", "resolution", "mainColor", "subColor"],
  });

  oneBitShaderMaterial.setVector3("reverseLightDirection", new Vector3(.75, .5, 1));
  oneBitShaderMaterial.setVector2("resolution", new Vector2(window.innerWidth, window.innerHeight));
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
      });
      engine.hideLoadingUI();
    },
  );

  engine.runRenderLoop(() => {
    scene.render();
    engine.resize();
  });
};  

main();
