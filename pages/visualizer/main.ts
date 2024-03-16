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
import { Inspector } from '@babylonjs/inspector';

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

const PARTICLE_NUMS = 100_000;

// Compute

const initialParticles = new Float32Array(
  [...new Array(PARTICLE_NUMS)]
    .map(() => [
      Math.random() * 2 - 1, // position
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1, // p_direction
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1, // velocity
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ])
    .flat(),
);

const uniforms = new UniformBuffer(engine, undefined, undefined, 'uniforms');
uniforms.addUniform('deltaTime', 1);
uniforms.updateFloat('deltaTime', 1);
uniforms.addUniform('particleCount', PARTICLE_NUMS);
uniforms.updateUInt('particleCount', PARTICLE_NUMS);
uniforms.update();

const particleBuffer = new StorageBuffer(
  engine,
  initialParticles.byteLength,
  Constants.BUFFER_CREATIONFLAG_STORAGE |
    Constants.BUFFER_CREATIONFLAG_VERTEX |
    Constants.BUFFER_CREATIONFLAG_READ |
    Constants.BUFFER_CREATIONFLAG_WRITE,
);

particleBuffer.update(initialParticles);

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

// Vertex

const particleMeshMaterial = new ShaderMaterial(
  'particle',
  scene,
  {
    vertexSource: particleVertexShaderSource,
    fragmentSource: particleFragmentShaderSource,
  },
  {
    attributes: ['p_position', 'p_direction', 'velocity', 'normal'],
    uniforms: ['time', 'world', 'worldViewProjection'],
  },
);

const vertexPositionBuffer = new VertexBuffer(
  engine,
  particleBuffer.getBuffer(),
  's_position',
  false,
  false,
  9,
  true,
  0,
  3,
);

const vertexDirectionBuffer = new VertexBuffer(
  engine,
  particleBuffer.getBuffer(),
  'p_direction',
  false,
  false,
  9,
  true,
  3,
  3,
);

const vertexVelocityBuffer = new VertexBuffer(
  engine,
  particleBuffer.getBuffer(),
  'velocity',
  false,
  false,
  9,
  true,
  6,
  3,
);

const mesh = MeshBuilder.CreatePolyhedron(
  'oct',
  { type: 3, size: 1, updatable: true },
  scene,
);
mesh.material = particleMeshMaterial;

// particleBuffer.getBuffer()

// mesh.thinInstanceSetBuffer("a", )
// mesh.createInstance('i0');
// mesh.createInstance('i0');

console.log(mesh.getVertexBuffer('position')?.getFloatData());

// mesh.setVerticesBuffer(vertexPositionBuffer);
// mesh.setVerticesBuffer(vertexDirectionBuffer);
// mesh.setVerticesBuffer(vertexVelocityBuffer);

// const positionBuffer = mesh.getVertexBuffer(VertexBuffer.PositionKind);
// console.log(mesh.getVertexBuffer('p_direction'));

let time = 0;

engine.runRenderLoop(() => {
  computeShader.dispatch(Math.ceil(PARTICLE_NUMS / 64));
  time += scene.deltaTime;
  particleMeshMaterial.setFloat('time', time);
  scene.render();
  engine.resize();
});
