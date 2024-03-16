import { Scene, ShaderLanguage, ShaderMaterial } from '@babylonjs/core';

const createGroundMaterial = (scene: Scene) => {
  const ground = new ShaderMaterial(
    'ground',
    scene,
    {},
    { shaderLanguage: ShaderLanguage.WGSL },
  );
};

const particleMeshMaterial = (scene: Scene) => {
  const shader = new ShaderMaterial(
    'particle',
    scene,
    {
      vertexSource: ``,
      fragmentSource: ``,
    },
    {
      attributes: ['position'],
    },
  );
};
