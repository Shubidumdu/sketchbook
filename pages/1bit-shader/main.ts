import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Effect,
  Engine,
  HighlightLayer,
  Matrix,
  MeshBuilder,
  PostProcess,
  Scene,
  SceneLoader,
  ShadowGenerator,
  StandardMaterial,
  Vector2,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import bitPath from './1bit.glb';
import { ShaderMaterial } from '@babylonjs/core';
import { NormalMaterial, SimpleMaterial } from '@babylonjs/materials';
import { Inspector } from '@babylonjs/inspector';

const rootUrl = bitPath.split('/');
const sceneFile = rootUrl.pop();

Effect.ShadersStore['1bitFragmentShader'] = `
  #ifdef GL_ES
  precision highp float;
  #endif

  // Samplers
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform sampler2D depthSampler;

  // Parameters
  uniform vec2 screenSize;
  uniform float threshold;

  const float scale = 1.;
  const float halfScaleFloor = floor(scale * 0.5);
  const float halfScaleCeil = ceil(scale * 0.5);
  const float depthThreshold = 1.5;
  const float normalThreshold = .4;

  void main(void) 
  {
      vec2 texelSize = vec2(1.0 / screenSize.x, 1.0 / screenSize.y);
      vec4 baseColor = texture2D(textureSampler, vUV);
      vec2 bottomLeftUV = vUV - texelSize * halfScaleFloor;
      vec2 topRightUV = vUV + texelSize * halfScaleCeil;
      vec2 bottomRightUV = vUV + vec2(texelSize.x * halfScaleCeil, -texelSize.y * halfScaleFloor);
      vec2 topLeftUV = vUV + vec2(-texelSize.x * halfScaleFloor, texelSize.y * halfScaleCeil);
      float depth0 = texture2D(depthSampler, bottomLeftUV).r;
      float depth1 = texture2D(depthSampler, topRightUV).r;
      float depth2 = texture2D(depthSampler, bottomRightUV).r;
      float depth3 = texture2D(depthSampler, topLeftUV).r;
      float diffDepth0 = depth1 - depth0;
      float diffDepth1 = depth3 - depth2;
      float edgeDepth = sqrt(pow(diffDepth0, 2.) + pow(diffDepth1, 2.)) * 100.;
      edgeDepth = edgeDepth > depthThreshold ? 1. : 0.;

      vec3 normal0 = texture2D(textureSampler, bottomLeftUV).rgb;
      vec3 normal1 = texture2D(textureSampler, topRightUV).rgb;
      vec3 normal2 = texture2D(textureSampler, bottomRightUV).rgb;
      vec3 normal3 = texture2D(textureSampler, topLeftUV).rgb;
      vec3 diffNormal0 = normal1 - normal0;
      vec3 diffNormal1 = normal3 - normal2;
      float edgeNormal = sqrt(dot(diffNormal0, diffNormal0) + dot(diffNormal1, diffNormal1));
      edgeNormal = edgeNormal > normalThreshold ? 1. : 0.;

      float edge = max(edgeDepth, 0.);
      if (edge == 1.) {
        gl_FragColor = vec4(vec3(0.), 1.);
      } else {
        gl_FragColor = baseColor;
      }
  }
`;

const main = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, false);
  const scene = new Scene(engine);
  const highlight = new HighlightLayer('hl', scene, {
    isStroke: true,
    mainTextureRatio: 2,
  });
  highlight.innerGlow = true;
  highlight.blurHorizontalSize = 0.1;
  highlight.blurVerticalSize = 0.1;
  const light = new DirectionalLight('light', new Vector3(2, -2, -4), scene);
  scene.clearColor = new Color4(0, 0, 0, 1);
  const camera = new ArcRotateCamera('camera', 1, 1, 10, Vector3.Zero(), scene);
  camera.minZ = 0;
  camera.maxZ = 100;
  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 100, height: 100 },
    scene,
  );
  ground.position.y = -1.438;
  const groundMaterial = new StandardMaterial('mat', scene);
  groundMaterial.diffuseColor = new Color3(1., 0., 0.);
  groundMaterial.cameraColorGradingEnabled = false;
  ground.material = groundMaterial;
  ground.receiveShadows = true;

  const shadowGenerator = new ShadowGenerator(512, light);
  shadowGenerator.useExponentialShadowMap = true;
  shadowGenerator.setDarkness(0);

  camera.target = Vector3.Zero();
  camera.attachControl(canvas, true);
  engine.displayLoadingUI();

  const oneBitShaderMaterial = new ShaderMaterial(
    'oneBitShader',
    scene,
    './1bit-shader',
    {
      attributes: ['position', 'normal', 'uv'],
      uniforms: [
        'world',
        'view',
        'worldViewProjection',
        'reverseLightDirection',
        'mainColor',
        'subColor',
      ],
    },
  );

  const renderer = scene.enableDepthRenderer();

  const targetMatrix = new Matrix();
  camera
    .getWorldMatrix()
    .invertToRef(targetMatrix)
    .transposeToRef(targetMatrix);

  oneBitShaderMaterial.setVector3(
    'reverseLightDirection',
    light.position.normalizeToNew(),
  );
  oneBitShaderMaterial.setVector3('mainColor', new Vector3(1, 1, 1));
  oneBitShaderMaterial.setVector3('subColor', new Vector3(0, 0, 0));

  SceneLoader.ImportMesh(
    '',
    rootUrl.join('/') + '/',
    sceneFile,
    scene,
    function (meshes) {
      meshes.forEach((mesh) => {
        // mesh.material = oneBitShaderMaterial;
        mesh.material = new NormalMaterial('normal', scene);
        shadowGenerator.addShadowCaster(mesh);
      });
      engine.hideLoadingUI();
    },
  );

  Inspector.Show(scene, {});

  const postProcess = new PostProcess(
    'My custom post process',
    '1bit',
    ['depthThreshold', 'screenSize'],
    ["depthSampler"],
    1,
    camera,
  );
  postProcess.onApply = function (effect) {
    effect.setVector2('screenSize', new Vector2(canvas.width, canvas.height));
    effect.setFloat('depthThreshold', 0.2);
    effect.setTexture('depthSampler', renderer.getDepthMap());
  };

  engine.runRenderLoop(() => {
    scene.render();
    engine.resize();
  });
};

main();
