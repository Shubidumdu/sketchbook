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
import backInBlackSrc from './audios/backInBlack.mp3';
import somethingAboutUsSrc from './audios/somethingAboutUs.mp3';
import funkyTownSrc from './audios/funkyTown.mp3';

const init = async () => {
  const audioTracks = {
    backInBlack: backInBlackSrc,
    somethingAboutUs: somethingAboutUsSrc,
    funkyTown: funkyTownSrc,
  };

  const audio = document.getElementById('audio') as HTMLAudioElement;
  audio.style.display = 'block';
  const select = document.getElementById('musicSelect') as HTMLSelectElement;
  select.style.display = 'block';

  audio.src = audioTracks['backInBlack'];

  select.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    const targetKey = target.selectedOptions[0]
      .value as keyof typeof audioTracks;
    audio.src = audioTracks[targetKey];
  });

  const audioContext = new window.AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = Math.pow(2, 5);
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const canvas = document.getElementById('babylon') as HTMLCanvasElement;

  const engine = new WebGPUEngine(canvas, {
    antialias: true,
  });
  await engine.initAsync();
  const scene = new Scene(engine);

  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 2,
    280,
    Vector3.Zero(),
    scene,
  );
  camera.attachControl(canvas, true);

  const PARTICLE_NUMS = 200_000;
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
      uniforms: ['time', 'world', 'worldViewProjection', 'mid', 'low', 'high'],
    },
  );

  mesh.material = particleMeshMaterial;

  const initialVertexPositions = mesh.getVerticesData(
    VertexBuffer.PositionKind,
  )!;

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
  uniforms.addUniform('high', 1);

  uniforms.updateFloat('deltaTime', 0.001);
  uniforms.updateFloat('radius', RADIUS);
  uniforms.updateInt('particleCount', PARTICLE_NUMS);
  uniforms.updateFloat('time', 0);
  uniforms.updateFloat('high', 0);
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

  let time = 0;

  scene.clearColor = Color4.FromHexString('#000000');

  scene.onBeforeRenderObservable.add(() => {
    analyser.getByteFrequencyData(dataArray);
    const deltaTime = scene.deltaTime;
    time += deltaTime;
    uniforms.updateFloat('deltaTime', deltaTime);
    uniforms.updateFloat('time', time);
    uniforms.updateFloat('high', dataArray[12]);
    uniforms.update();
    camera.alpha += deltaTime * 0.00025;
    computeShader.dispatch(Math.ceil(PARTICLE_NUMS / 64));
    particleMeshMaterial.setFloat('low', dataArray[4]);
    particleMeshMaterial.setFloat('mid', dataArray[8]);
    particleMeshMaterial.setFloat('high', dataArray[12]);
    mesh.setVerticesBuffer(positionBuffer, false);
    mesh.setVerticesBuffer(noiseBuffer, false);
    scene.clearColor = Color4.FromInts(
      dataArray[12] / 4,
      dataArray[8] / 4,
      dataArray[4] / 4,
      255,
    );
  });

  engine.runRenderLoop(() => {
    scene.render();
    engine.resize();
  });
};

const startButton = document.querySelector('.start > button');

startButton?.addEventListener('click', () => {
  init();
  startButton.parentElement?.remove();
  audio.star;
});
