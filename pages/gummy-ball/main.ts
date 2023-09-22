import { CustomMaterial } from '@babylonjs/materials';
import './style.scss';
import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  Vector3,
} from '@babylonjs/core';

const createScene = () => {
  const canvas = document.querySelector('canvas')! as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera('camera', 1, 1, 2, Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);
  sphere.material = createMaterial(scene);

  engine.runRenderLoop(() => {
    scene.render();
    engine.resize();
  });
};

const createMaterial = (scene: Scene) => {
  let time = 0;
  const material = new CustomMaterial('custom', scene);
  material.AddUniform('time', 'float', null);
  material.onBindObservable.add(() => {
    time++;
    if (material.getEffect()) {
      material.getEffect().setFloat('time', time);
    }
  });
  material.Vertex_Definitions(`
    vec3 wave(vec3 position) {
      return position + vec3(sin(position.x + time * .01), cos(position.y + time * 0.04), 0.);
    }
  `);
  material.Vertex_Before_PositionUpdated(
    '\
    result = vec3( positionUpdated+ 0.1*wave(positionUpdated) );\
    ',
  );

  return material;
};

createScene();
