import { Effect, ShaderMaterial } from '@babylonjs/core';
import goochFragmentShader from './shaders/gooch.fragment.glsl?raw';
import goochVertexShader from './shaders/gooch.vertex.glsl?raw';
import { scene } from './scene';

Effect.ShadersStore['goochFragmentShader'] = goochFragmentShader;
Effect.ShadersStore['goochVertexShader'] = goochVertexShader;

const goochShaderMaterial = new ShaderMaterial('goochShader', scene, 'gooch', {
  attributes: ['position', 'normal'],
  uniforms: ['world', 'worldViewProjection'],
});

export { goochShaderMaterial };
