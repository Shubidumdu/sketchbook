import { Effect, ShaderMaterial } from '@babylonjs/core';
import outlineFragmentShader from './shaders/outline.fragment.glsl?raw';
import oneBitFragmentShader from './shaders/1bit-shader.fragment.glsl?raw';
import oneBitVertexShader from './shaders/1bit-shader.vertex.glsl?raw';
import groundFragmentShader from './shaders/ground.fragment.glsl?raw';
import groundVertexShader from './shaders/ground.vertex.glsl?raw';
import { ShadowOnlyMaterial } from '@babylonjs/materials';
import { scene } from './scene';

Effect.ShadersStore['outlineFragmentShader'] = outlineFragmentShader;
Effect.ShadersStore['1bitFragmentShader'] = oneBitFragmentShader;
Effect.ShadersStore['1bitVertexShader'] = oneBitVertexShader;
Effect.ShadersStore['groundFragmentShader'] = groundFragmentShader;
Effect.ShadersStore['groundVertexShader'] = groundVertexShader;

const groundShadowMaterial = new ShadowOnlyMaterial('shadow', scene);
const oneBitShaderMaterial = new ShaderMaterial('oneBitShader', scene, '1bit', {
  attributes: ['position', 'normal', 'uv'],
  uniforms: [
    'world',
    'view',
    'worldViewProjection',
    'reverseLightDirection',
    'mainColor',
    'subColor',
  ],
});
const groundMaterial = new ShaderMaterial('groundShader', scene, 'ground', {
  attributes: ['position', 'normal', 'uv'],
  uniforms: ['world', 'view', 'worldViewProjection', 'mainColor', 'subColor'],
});

export { groundShadowMaterial, oneBitShaderMaterial, groundMaterial };
