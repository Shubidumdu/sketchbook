import { SceneLoader } from '@babylonjs/core';

export const importMeshes = async (filePath: string) => {
  const rootUrl = filePath.split('/');
  const sceneFile = rootUrl.pop();

  const { meshes } = await SceneLoader.ImportMeshAsync(
    '',
    rootUrl.join('/') + '/',
    sceneFile,
  );

  return meshes;
};
