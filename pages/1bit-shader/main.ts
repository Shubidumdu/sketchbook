import {
  ArcRotateCamera,
  Color4,
  DirectionalLight,
  Effect,
  Engine,
  Matrix,
  MeshBuilder,
  PostProcess,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Vector2,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.scss';
import meshesPath from './meshes.glb';
import { ShaderMaterial } from '@babylonjs/core';
import { ShadowOnlyMaterial } from '@babylonjs/materials';
import outlineShader from './outline.fragment.fx?raw';

const rootUrl = meshesPath.split('/');
const sceneFile = rootUrl.pop();

Effect.ShadersStore['1bitFragmentShader'] = outlineShader;

const main = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const engine = new Engine(canvas, false);
  const scene = new Scene(engine);
  const light = new DirectionalLight(
    'light',
    new Vector3(0.3, -.45, -.1),
    scene,
  );
  light.shadowMaxZ = 80;
  light.shadowMinZ = -20;
  scene.clearColor = new Color4(0, 0, 0, 1);
  const camera = new ArcRotateCamera('camera', 1, 1, 10, Vector3.Zero(), scene);
  camera.minZ = 0;
  camera.maxZ = 30;
  const groundShadow = MeshBuilder.CreateGround(
    'groundShadow',
    { width: 100, height: 100 },
    scene,
  );
  groundShadow.position.y = -1.438;
  const groundShadowMaterial = new ShadowOnlyMaterial('shadow', scene);
  groundShadow.material = groundShadowMaterial;
  groundShadow.receiveShadows = true;

  const shadowGenerator = new ShadowGenerator(1024, light, false, camera);
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

  oneBitShaderMaterial.setVector3(
    'reverseLightDirection',
    light.position.normalizeToNew(),
  );
  oneBitShaderMaterial.setVector3('mainColor', new Vector3(1, 1, 1));
  oneBitShaderMaterial.setVector3('subColor', new Vector3(0, 0, 0));

  const groundMaterial = new ShaderMaterial('groundShader', scene, './ground', {
    attributes: ['position', 'normal', 'uv'],
    uniforms: ['world', 'view', 'worldViewProjection', 'mainColor', 'subColor'],
  });
  groundMaterial.setVector3('mainColor', new Vector3(1, 1, 1));
  groundMaterial.setVector3('subColor', new Vector3(0, 0, 0));

  const ground = groundShadow.clone('ground');
  ground.position.y = -1.44;
  ground.material = groundMaterial;

  const renderer = scene.enableDepthRenderer();

  const targetMatrix = new Matrix();
  camera
    .getWorldMatrix()
    .invertToRef(targetMatrix)
    .transposeToRef(targetMatrix);

  SceneLoader.ImportMesh(
    '',
    rootUrl.join('/') + '/',
    sceneFile,
    scene,
    function (meshes) {
      meshes.forEach((mesh) => {
        mesh.material = oneBitShaderMaterial;
        shadowGenerator.addShadowCaster(mesh);
      });
      engine.hideLoadingUI();
    },
  );

  const postProcess = new PostProcess(
    'My custom post process',
    '1bit',
    ['depthThreshold', 'screenSize'],
    ['depthSampler'],
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
    const dpr = window.devicePixelRatio;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  });
};

main();
