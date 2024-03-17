import './style.scss';
import {
  ArcRotateCamera,
  Color4,
  ComputeShader,
  Constants,
  MeshBuilder,
  Scene,
  ShaderMaterial,
  StorageBuffer,
  UniformBuffer,
  Vector3,
  VertexBuffer,
  WebGPUEngine,
} from '@babylonjs/core';
import computeShaderSource from './shaders/compute.wgsl?raw';
import particleFragmentShaderSource from './shaders/fragment.glsl?raw';
import particleVertexShaderSource from './shaders/vertex.glsl?raw';

const canvas = document.getElementById('babylon') as HTMLCanvasElement;
const engine = new WebGPUEngine(canvas);
await engine.initAsync();
const scene = new Scene(engine);
scene.clearColor = Color4.FromHexString('#212E33');

const camera = new ArcRotateCamera(
  'camera',
  -Math.PI / 2,
  Math.PI / 2,
  10,
  Vector3.Zero(),
  scene,
);
camera.attachControl(canvas, true);

const PARTICLE_NUMS = 5_000;

const mesh = MeshBuilder.CreatePolyhedron('oct', { type: 3, size: 1 }, scene);
mesh.forcedInstanceCount = PARTICLE_NUMS;

const particleMeshMaterial = new ShaderMaterial(
  'particle',
  scene,
  {
    vertexSource: particleVertexShaderSource,
    fragmentSource: particleFragmentShaderSource,
  },
  {
    attributes: ['position', 'v_position', 'p_position', 'velocity', 'normal'],
    uniforms: ['time', 'world', 'worldViewProjection'],
  },
);

mesh.material = particleMeshMaterial;
mesh.material.wireframe = true;

const initialVertexPositions = mesh.getVerticesData(VertexBuffer.PositionKind)!;

const vertexPositionBuffer = (() => {
  return new VertexBuffer(
    engine,
    initialVertexPositions,
    'v_position',
    false,
    false,
    3,
    false,
  );
})();

mesh.setVerticesBuffer(vertexPositionBuffer);

// Compute

const initialParticles = new Float32Array(
  [...new Array(PARTICLE_NUMS)]
    .map(() => {
      const radian = 2 * Math.PI * Math.random();
      const r = 4;
      const x = 2 * Math.PI * (2 * Math.random() - 1);
      const y = 2 * Math.PI * (2 * Math.random() - 1);
      const z =
        (Math.random() > 0.5 ? 1 : -1) *
        Math.sqrt(Math.pow(r, 2) - Math.pow(x, 2) - Math.pow(y, 2));
      console.log(z);
      return [
        x, // position
        y,
        z,
        0,
        Math.random() * 2 - 1, // p_direction
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        0,
        Math.random() * 2 - 1, // velocity
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        0,
      ];
    })
    .flat(),
);

const uniforms = new UniformBuffer(engine, undefined, undefined, 'uniforms');
uniforms.addUniform('deltaTime', 1);
uniforms.updateFloat('deltaTime', 0.001);
uniforms.addUniform('particleCount', 1);
uniforms.updateUInt('particleCount', PARTICLE_NUMS);
uniforms.update();

const particleBuffer = new StorageBuffer(
  engine,
  initialParticles.byteLength,
  Constants.BUFFER_CREATIONFLAG_VERTEX |
    Constants.BUFFER_CREATIONFLAG_READWRITE,
);

particleBuffer.update(initialParticles);

const positionBuffer = new VertexBuffer(
  engine,
  particleBuffer.getBuffer(),
  'p_position',
  false,
  false,
  12,
  true,
  0,
  4,
);

const computeShader = new ComputeShader(
  'computeShader',
  engine,
  {
    computeSource: computeShaderSource,
  },
  {
    bindingsMapping: {
      uniforms: { group: 0, binding: 0 },
      particles: { group: 0, binding: 1 },
    },
  },
);

computeShader.setUniformBuffer('uniforms', uniforms);
computeShader.setStorageBuffer('particles', particleBuffer);

engine.runRenderLoop(() => {
  scene.render();
  engine.resize();
});

scene.onBeforeRenderObservable.add(async () => {
  uniforms.updateFloat('deltaTime', scene.deltaTime);
  computeShader.dispatch(Math.ceil(PARTICLE_NUMS / 64));
  mesh.setVerticesBuffer(positionBuffer, false);
});
