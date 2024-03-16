import './style.scss';
import {
  ArcRotateCamera,
  Color4,
  ComputeShader,
  Constants,
  DataBuffer,
  Engine,
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
// engine.compatibilityMode = false;
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

const PARTICLE_NUMS = 100;

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

// particleMeshMaterial.wireframe = true;

mesh.material = particleMeshMaterial;
mesh.material.wireframe = true;

const initialVertexPositions = mesh.getVerticesData(VertexBuffer.PositionKind)!;

const vertexPositionBuffer = (() => {
  // const newBuffer = new Float32Array(initialVertexPositions.length);

  // [...Array(PARTICLE_NUMS)].forEach((_, index) =>
  //   newBuffer.set(
  //     initialVertexPositions,
  //     index * initialVertexPositions.length,
  //   ),
  // );

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

// mesh.setIndices(indices!);
mesh.setVerticesBuffer(vertexPositionBuffer);

// const realVertexBuffer = new VertexBuffer(engine);

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

// const uniforms = new UniformBuffer(engine, undefined, undefined, 'uniforms');
// uniforms.addUniform('deltaTime', 1);
// uniforms.updateFloat('deltaTime', 1);
// uniforms.addUniform('particleCount', PARTICLE_NUMS);
// uniforms.updateUInt('particleCount', PARTICLE_NUMS);
// uniforms.update();

const particleBuffer = new StorageBuffer(
  engine,
  initialParticles.byteLength,
  Constants.BUFFER_CREATIONFLAG_STORAGE |
    Constants.BUFFER_CREATIONFLAG_VERTEX |
    Constants.BUFFER_CREATIONFLAG_READ |
    Constants.BUFFER_CREATIONFLAG_WRITE,
);

particleBuffer.update(initialParticles);

const positionBuffer = new VertexBuffer(
  engine,
  particleBuffer.getBuffer(),
  'p_position',
  false,
  false,
  9,
  true,
  0,
  3,
);

mesh.setVerticesBuffer(positionBuffer, false);

// const computeShader = new ComputeShader(
//   'computeShader',
//   engine,
//   {
//     computeSource: computeShaderSource,
//   },
//   {
//     bindingsMapping: {
//       uniforms: { group: 0, binding: 0 },
//       particles: { group: 0, binding: 1 },
//     },
//   },
// );

// computeShader.setUniformBuffer('uniforms', uniforms);
// computeShader.setStorageBuffer('particles', particleBuffer);

// // Vertex

let time = 0;

engine.runRenderLoop(() => {
  time += scene.deltaTime;
  scene.render();
  engine.resize();
});
