import {
  Color3,
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  ShadowGenerator,
  SpotLight,
  StandardMaterial,
  Texture,
  Vector3,
  WebGPUEngine,
} from '@babylonjs/core';
import './style.scss';
import { SimpleMaterial } from '@babylonjs/materials';
import { Inspector } from '@babylonjs/inspector';
import { rgbToColor3 } from '../utils/color';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const engine = new WebGPUEngine(canvas, {
  antialias: true,
});

await engine.initAsync();

const scene = new Scene(engine);
const camera = new FreeCamera('camera', new Vector3(0, 0, -10), scene);
camera.setTarget(Vector3.Zero());
camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
const rect = engine.getRenderingCanvasClientRect();
// const aspect = rect.height / rect.width;
camera.orthoLeft = 0;
camera.orthoRight = 3 * Math.PI;
camera.orthoBottom = -4;
camera.orthoTop = 4;

const light = new HemisphericLight('light1', new Vector3(-2, 12, -2), scene);
light.intensity = 1.25;

const pointLight = new PointLight(
  'pointLight',
  new Vector3((Math.PI * 3) / 2, -3, -18),
  scene,
);
pointLight.intensity = 0.2;
pointLight.specular = rgbToColor3(255, 253, 221);

const shadowGenerator = new ShadowGenerator(4096, pointLight);
shadowGenerator.darkness = 0.75;
shadowGenerator.normalBias = 0.5;
shadowGenerator.filter = ShadowGenerator.FILTER_PCSS;

type FlowOptions = {
  frequency?: number;
  amplitude?: number;
  translate?: number;
  position?: Vector3;
  speed?: number;
  color?: Color3;
};

const makeFlow = (name: string, options: FlowOptions = {}) => {
  const {
    frequency = 1,
    translate = 0,
    amplitude = 1,
    position = new Vector3(0, 0, 0),
    speed = 0.05,
    color = new Color3(1, 1, 1),
  } = options;
  console.log(color);
  const cycle = (2 * Math.PI) / frequency;
  const totalLength = camera.orthoRight! + 0.5 * Math.PI + cycle;
  const corners: Vector3[] = [];
  const tops: Vector3[] = [];
  const uppers: Vector3[] = [];
  const bottoms: Vector3[] = [];

  [...Array(240)].forEach((_, i) => {
    const x = (i / 240) * totalLength;
    const y = Math.sin(frequency * (x + translate)) * amplitude;
    corners.push(new Vector3(x, y + 0.02, 0.05));
    tops.push(new Vector3(x, y, 0));
    uppers.push(new Vector3(x, y, 0));
    bottoms.push(new Vector3(x, camera.orthoBottom!, 0));
  });

  const flow = MeshBuilder.CreateRibbon(name, {
    pathArray: [corners, tops, uppers, bottoms],
    sideOrientation: Mesh.FRONTSIDE,
  });
  flow.receiveShadows = true;

  const material = new StandardMaterial('material', scene);
  material.diffuseColor = color;

  flow.position = position;
  flow.metadata = {
    cycle,
    speed,
  };
  flow.material = material;
  shadowGenerator.getShadowMap()?.renderList?.push(flow);

  return flow;
};

const plane = MeshBuilder.CreatePlane('plane');
plane.scaling = new Vector3(100, 100, 100);
plane.position.z = 1;
plane.receiveShadows = true;

const material = new SimpleMaterial('materialPlane', scene);
material.diffuseColor = rgbToColor3(87, 183, 242);
plane.material = material;

const FLOW_OPTIONS: readonly FlowOptions[] = [
  {
    frequency: 1,
    translate: 0,
    amplitude: 0.9,
    position: new Vector3(0, 4, 0),
    speed: 0.05,
    color: rgbToColor3(223, 239, 242),
  },
  {
    frequency: 1,
    translate: Math.PI,
    amplitude: 0.6,
    position: new Vector3(0, 3, -1),
    speed: 0.06,
    color: rgbToColor3(5, 131, 242),
  },
  {
    frequency: 1,
    translate: Math.PI / 3,
    amplitude: 0.8,
    position: new Vector3(0, 2, -2),
    speed: 0.03,
    color: rgbToColor3(94, 200, 242),
  },
  {
    frequency: 1,
    translate: Math.PI - 1,
    amplitude: 0.8,
    position: new Vector3(0, 1, -3),
    speed: 0.06,
    color: rgbToColor3(223, 239, 242),
  },
  {
    frequency: 1,
    translate: -Math.PI / 2,
    amplitude: 1,
    position: new Vector3(0, 0, -4),
    speed: 0.07,
    color: rgbToColor3(87, 183, 242),
  },
  {
    frequency: 1,
    translate: 0,
    amplitude: 0.8,
    position: new Vector3(0, -1, -5),
    speed: 0.03,
    color: rgbToColor3(5, 131, 242),
  },
  {
    frequency: 1,
    translate: Math.PI,
    amplitude: 0.6,
    position: new Vector3(0, -2, -6),
    speed: 0.08,
    color: rgbToColor3(223, 239, 242),
  },
] as const;

const flows = FLOW_OPTIONS.map((options, index) =>
  makeFlow(`flow${index + 1}`, options),
);

engine.runRenderLoop(() => {
  const fps = Math.round(1000 / engine.getDeltaTime());
  const speedRatio = fps / 60;
  flows.forEach((flow) => {
    if (flow.position.x < -flow.metadata.cycle) {
      flow.position.x = 0;
    }
    flow.position.x -= flow.metadata.speed / speedRatio;
  });
  engine.resize();
  scene.render();
});

scene.animationTimeScale = 0.5;

Inspector.Show(scene, {});
