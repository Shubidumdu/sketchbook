import { Engine, Scene } from '@babylonjs/core';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const engine = new Engine(canvas, false);
const scene = new Scene(engine);

export { canvas, engine, scene };
