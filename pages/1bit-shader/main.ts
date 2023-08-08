import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
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
  const camera = new ArcRotateCamera('camera', 1, 1, 10, Vector3.Zero(), scene);
  
  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  engine.displayLoadingUI();

  const oneBitShaderMaterial = new ShaderMaterial("oneBitShader", scene, './1bit-shader', {
    attributes: ["position", "normal", "uv"],
    uniforms: ["worldViewProjection", "reverseLightDirection"],
  });

  oneBitShaderMaterial.setVector3("reverseLightDirection", new Vector3(1, 1, 1));

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
