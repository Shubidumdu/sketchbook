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
scene.clearColor = Color4.FromHexString('#ffffff');

const camera = new ArcRotateCamera(
  'camera',
  -Math.PI / 2,
  Math.PI / 2,
  280,
  Vector3.Zero(),
  scene,
);
camera.attachControl(canvas, true);

const PARTICLE_NUMS = 500_000;
const RADIUS = 80;

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
    attributes: [
      'position',
      'v_position',
      'p_position',
      'velocity',
      'normal',
      'noise',
    ],
    uniforms: ['time', 'world', 'worldViewProjection'],
  },
);

mesh.material = particleMeshMaterial;
// mesh.material.wireframe = true;

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
      const d = 1000;
      const x = d * (2 * Math.random() - 1);
      const y = d * (2 * Math.random() - 1);
      const z = d * (2 * Math.random() - 1);
      return [
        x, // position
        y,
        z,
        0,
        0, // velocity
        0,
        0,
        0, // noise
        Math.random() * 2 - 1, // rotation
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        0,
      ];
    })
    .flat(),
);

const uniforms = new UniformBuffer(engine, undefined, undefined, 'uniforms');

uniforms.addUniform('deltaTime', 1);
uniforms.addUniform('radius', 1);
uniforms.addUniform('particleCount', 1);
uniforms.addUniform('time', 1);

uniforms.updateFloat('deltaTime', 0.001);
uniforms.updateFloat('radius', RADIUS);
uniforms.updateInt('particleCount', PARTICLE_NUMS);
uniforms.updateFloat('time', 0);
uniforms.update();

const particleBuffer = new StorageBuffer(
  engine,
  initialParticles.byteLength,
  Constants.BUFFER_CREATIONFLAG_STORAGE |
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

const noiseBuffer = new VertexBuffer(
  engine,
  particleBuffer.getBuffer(),
  'noise',
  false,
  false,
  12,
  true,
  7,
  1,
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

let time = 0;

scene.onBeforeRenderObservable.add(() => {
  const deltaTime = scene.deltaTime;
  time += deltaTime;
  uniforms.updateFloat('deltaTime', deltaTime);
  uniforms.updateFloat('time', time);
  uniforms.update();
  camera.alpha += deltaTime * 0.0005;
  computeShader.dispatch(Math.ceil(PARTICLE_NUMS / 64));
  mesh.setVerticesBuffer(positionBuffer, false);
  mesh.setVerticesBuffer(noiseBuffer, false);
});
