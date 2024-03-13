import { createGround } from './meshes';
import './style.scss';
import {
  ArcRotateCamera,
  Color4,
  ComputeShader,
  Constants,
  HemisphericLight,
  Scene,
  StorageBuffer,
  UniformBuffer,
  Vector3,
  WebGPUEngine,
} from '@babylonjs/core';

const canvas = document.getElementById('babylon') as HTMLCanvasElement;
const engine = new WebGPUEngine(canvas);
await engine.initAsync();
const scene = new Scene(engine);
scene.clearColor = Color4.FromHexString('#212E33');

const camera = new ArcRotateCamera(
  'camera',
  -Math.PI / 2,
  Math.PI / 8,
  200,
  Vector3.Zero(),
  scene,
);
camera.attachControl(canvas, true);

const light = new HemisphericLight('light', new Vector3(1, 1, 1), scene);

const ground = createGround(scene);

const PARTICLE_NUMS = 100;

const initialData = new Float32Array(
  [...new Array(PARTICLE_NUMS)]
    .map(() => [Math.random() * 2 - 1, Math.random() * 2 - 1])
    .flat(),
);

const params = new UniformBuffer(engine, undefined, undefined, 'params');
params.addFloat3('direction', 0.1, 0.1, 0.1);
params.addUniform('deltaTime', 1);

params.updateFloat3('direction', 0.1, 0.1, 0.1);
params.updateFloat('deltaTime', 1);

const storageBuffer = new StorageBuffer(
  engine,
  initialData.byteLength,
  Constants.BUFFER_CREATIONFLAG_VERTEX |
    Constants.BUFFER_CREATIONFLAG_WRITE |
    Constants.BUFFER_CREATIONFLAG_READ,
);

console.log(initialData);

storageBuffer.update(initialData);

const cs1 = new ComputeShader(
  'cs1',
  engine,
  {
    computeSource: `
struct Params {
  direction: vec3f,
  deltaTime: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> positions: array<vec2f>;

@compute @workgroup_size(64, 1, 1) fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let deltaTime = params.deltaTime * .5;
  positions[globalId.x] += vec2f(0.0001, 0.0001);
}
    `,
  },
  {
    bindingsMapping: {
      params: { group: 0, binding: 0 },
      positions: { group: 0, binding: 1 },
    },
  },
);

cs1.setUniformBuffer('params', params);
cs1.setStorageBuffer('positions', storageBuffer);

cs1.dispatch(Math.ceil(PARTICLE_NUMS / 64));
const result = await storageBuffer.read(
  undefined,
  undefined,
  new Float32Array(PARTICLE_NUMS * 2),
  true,
);

console.log(result);

engine.runRenderLoop(async () => {
  cs1.dispatch(Math.ceil(PARTICLE_NUMS / 64));
  const result = await storageBuffer.read(
    undefined,
    undefined,
    new Float32Array(PARTICLE_NUMS * 2),
    true,
  );
  console.log(result);
  scene.render();
  engine.resize();
});
