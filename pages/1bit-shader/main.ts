import {
  ArcRotateCamera,
  Color3,
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
import { hexToRgb } from '../../utils/color';

const rootUrl = meshesPath.split('/');
const sceneFile = rootUrl.pop();

const [mainColor, subColor] = document.querySelectorAll<HTMLInputElement>('input');
mainColor.value = '#ffffff';
subColor.value = '#000000';

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

  const groundMaterial = new ShaderMaterial('groundShader', scene, './ground', {
    attributes: ['position', 'normal', 'uv'],
    uniforms: ['world', 'view', 'worldViewProjection', 'mainColor', 'subColor'],
  });

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
    ['depthThreshold', 'screenSize', 'outlineColor'],
    ['depthSampler'],
    1,
    camera,
  );

  postProcess.onApply = function (effect) {
    const subColorRgb = hexToRgb(subColor.value, true);
    effect.setVector2('screenSize', new Vector2(canvas.width, canvas.height));
    effect.setFloat('depthThreshold', 0.2);
    effect.setTexture('depthSampler', renderer.getDepthMap());
    effect.setVector3('outlineColor', new Vector3(...subColorRgb));
  };

  engine.runRenderLoop(() => {
    const mainColorRgb = hexToRgb(mainColor.value, true);
    const subColorRgb = hexToRgb(subColor.value, true);
    oneBitShaderMaterial.setVector3('mainColor', new Vector3(...mainColorRgb));
    oneBitShaderMaterial.setVector3('subColor', new Vector3(...subColorRgb));
    groundMaterial.setVector3('mainColor', new Vector3(...mainColorRgb));
    groundMaterial.setVector3('subColor', new Vector3(...subColorRgb));
    groundShadowMaterial.shadowColor = new Color3(...subColorRgb);
    scene.clearColor = new Color4(...mainColorRgb, 1);
    const dpr = window.devicePixelRatio;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    scene.render();
  });
};

main();
