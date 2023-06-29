import {
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  Vector3,
  WebGPUEngine,
} from '@babylonjs/core';
import './style.scss';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const engine = new WebGPUEngine(canvas, {
  antialias: true,
});

await engine.initAsync();

const scene = new Scene(engine);
const camera = new FreeCamera('camera', new Vector3(0, 0, -10), scene);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);
camera.mode = FreeCamera.ORTHOGRAPHIC_CAMERA;
const rect = engine.getRenderingCanvasClientRect();
const aspect = rect.height / rect.width;
camera.orthoLeft = 0;
camera.orthoRight = 3 * Math.PI;
camera.orthoBottom = -4;
camera.orthoTop = 4;

const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
light.intensity = 1;

type FlowOptions = {
  frequency?: number;
  amplitude?: number;
  translate?: number;
  position?: Vector3;
  speed?: number;
};

const makeFlow = (name: string, options: FlowOptions = {}) => {
  const {
    frequency = 1,
    translate = 0,
    amplitude = 1,
    position = new Vector3(0, 0, 0),
    speed = 0.05,
  } = options;
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
  flow.position = position;

  flow.metadata = {
    cycle,
    speed,
  };

  return flow;
};

const plane = MeshBuilder.CreatePlane('plane');
plane.scaling = new Vector3(100, 100, 100);
plane.position.z = 1;

const FLOW_OPTIONS: readonly FlowOptions[] = [
  {
    frequency: 1,
    translate: 0,
    amplitude: 0.9,
    position: new Vector3(0, 4, 0),
    speed: 0.05,
  },
  {
    frequency: 1,
    translate: Math.PI,
    amplitude: 0.6,
    position: new Vector3(0, 3, -1),
    speed: 0.06,
  },
  {
    frequency: 1,
    translate: Math.PI / 3,
    amplitude: 0.8,
    position: new Vector3(0, 2, -2),
    speed: 0.03,
  },
  {
    frequency: 1,
    translate: Math.PI - 1,
    amplitude: 0.8,
    position: new Vector3(0, 1, -3),
    speed: 0.06,
  },
  {
    frequency: 1,
    translate: -Math.PI / 2,
    amplitude: 1,
    position: new Vector3(0, 0, -4),
    speed: 0.07,
  },
  {
    frequency: 1,
    translate: 0,
    amplitude: 0.8,
    position: new Vector3(0, -1, -5),
    speed: 0.03,
  },
  {
    frequency: 1,
    translate: Math.PI,
    amplitude: 0.6,
    position: new Vector3(0, -2, -6),
    speed: 0.08,
  },
  {
    frequency: 0.6,
    translate: Math.PI / 4,
    amplitude: 1.2,
    position: new Vector3(0, -3, -7),
    speed: 0.06,
  },
] as const;

const flows = FLOW_OPTIONS.map((options, index) =>
  makeFlow(`flow${index + 1}`, options),
);

engine.runRenderLoop(() => {
  const time = performance.now();
  flows.forEach((flow) => {
    if (flow.position.x < -flow.metadata.cycle) {
      flow.position.x = 0;
    }
    flow.position.x -= flow.metadata.speed;
  });
  engine.resize();
  scene.render();
});

// Inspector.Show(scene, {});
