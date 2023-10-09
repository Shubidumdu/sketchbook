import { createNoise2D } from 'simplex-noise';
import './style.scss';
import {
  Application,
  BlurFilter,
  Container,
  DisplacementFilter,
  Filter,
  Graphics,
  RenderTexture,
  Sprite,
  Texture,
} from 'pixi.js';
import filterVertexShader from './shaders/filter.vert.glsl?raw';
import filterFragmentShader from './shaders/filter.frag.glsl?raw';

// const texture = Texture.from(normalMap);
// const filter = new Filter(filterVertexShader, filterFragmentShader, {
//   uTexture: texture,
// });

const app = new Application({
  background: '#f3f5e4',
  antialias: true,
  resizeTo: window,
});

document.body.appendChild(app.view as HTMLCanvasElement);

const container = new Container();

app.stage.addChild(container);

const graphics = new Graphics();

graphics.filters = [
  new BlurFilter(0.8),
  // new DisplacementFilter(Sprite.from(texture), 4),
];

//
let renderTexture = RenderTexture.create({
  width: app.screen.width,
  height: app.screen.height,
});
let currentTexture = renderTexture;
let outputSprite = new Sprite(currentTexture);
app.stage.addChild(outputSprite);
container.addChild(graphics);
//

let time = 0;

const noise2D = createNoise2D();

app.ticker.add((delta) => {
  time += delta / 24;
  drawCircle();
  drawCircle2();
  drawLine2();
  drawCircle3();
  drawCircle4();
  drawCircularLine2();
  drawSpot();
  drawLine();
  drawCircularLine();

  app.renderer.render(app.stage, {
    renderTexture,
    clear: false,
  });

  graphics.clear();
});

type DrawerOptions = {
  x: number;
  y: number;
  color: string;
  size: number;
};

const initCircleDrawer = (options: DrawerOptions) => {
  let x = options.x;
  let y = options.y;
  let size: number;

  return () => {
    if (x < 0 || x > app.screen.width) {
      x = app.screen.width * Math.random();
    }
    if (y < 0 || y > app.screen.height) {
      y = app.screen.height * Math.random();
    }
    x += noise2D(x + time, y) * 24;
    y += noise2D(x, y + time) * 24;
    size = Math.max(noise2D(x, y) * options.size, 1);
    graphics.lineStyle(0);
    graphics.beginFill(options.color);
    graphics.drawCircle(x, y, size);
    graphics.endFill();
  };
};

const initSpotDrawer = (options: DrawerOptions) => {
  let x = options.x;
  let y = options.y;
  let size: number;
  let startTime = time;

  return () => {
    const progress = time - startTime;
    if (progress > Math.PI / 2) {
      x = Math.random() * app.screen.width;
      y = Math.random() * app.screen.height;
      startTime = time;
      return;
    }
    x += Math.sin(time) + noise2D(x, y) * 8;
    y += Math.cos(time) + noise2D(x, y) * 8;
    size = Math.cos(progress) * options.size;
    graphics.lineStyle(0);
    graphics.beginFill(options.color);
    graphics.moveTo(x, y);
    graphics.drawCircle(x, y, size);
    graphics.moveTo(x, y);
    graphics.drawCircle(x, y, size);
    graphics.endFill();
  };
};

const initLineDrawer = (options: DrawerOptions) => {
  let x = options.x;
  let y = options.y;
  let size: number;
  let startTime = time;
  const random = () => noise2D(x, y) / 2;
  let radian = Math.random() * Math.PI * 2;
  let resultRandom = random();

  return () => {
    const _time = time;
    const progress = (_time - startTime) / 2;
    if (progress > Math.PI / 2) {
      x = Math.random() * app.screen.width;
      y = Math.random() * app.screen.height;
      startTime = _time;
      radian = Math.random() * Math.PI * 2;
      return;
    }
    const randomValue = random();
    x +=
      (Math.cos(radian) - Math.sin(radian)) *
      Math.cos(_time + randomValue * 2) *
      4;
    y +=
      (Math.sin(radian) + Math.sin(radian)) *
      Math.sin(_time + randomValue * 2) *
      4;
    size =
      Math.sin(progress * 2) * options.size + (options.size / 4) * resultRandom;
    graphics.lineStyle(0);
    graphics.beginFill(options.color);
    graphics.moveTo(x, y);
    graphics.drawCircle(x, y, size);
    graphics.moveTo(x, y);
    graphics.drawCircle(x, y, size);
    graphics.endFill();
  };
};

const initCircularLineDrawer = (options: DrawerOptions) => {
  let x = options.x;
  let y = options.y;
  let size: number;
  let startTime = time;
  const random = () => noise2D(x, y) / 2;
  let resultRandom = random();
  let radian = Math.random() * Math.PI * 2;

  return () => {
    const _time = time;
    const progress = (_time - startTime) / 2;
    if (progress > Math.PI) {
      x = Math.random() * app.screen.width;
      y = Math.random() * app.screen.height;
      startTime = _time;
      resultRandom = random();
      radian = Math.random() * Math.PI * 2;
      return;
    }
    const randomValue = random();
    x +=
      (Math.cos(radian) - Math.sin(radian)) *
      Math.cos(_time + randomValue * 4) *
      4;
    y +=
      (Math.sin(radian) + Math.sin(radian)) *
      Math.sin(_time + randomValue * 4) *
      4;
    size =
      Math.sin(progress) * options.size + (options.size / 4) * resultRandom;
    graphics.lineStyle(0);
    graphics.beginFill(options.color);
    graphics.moveTo(x, y);
    graphics.drawCircle(x, y, size);
    graphics.moveTo(x, y);
    graphics.drawCircle(x, y, size);
    graphics.endFill();
  };
};

const drawCircle = initCircleDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#000',
  size: 10,
});
const drawCircle2 = initCircleDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#000',
  size: 8,
});
const drawCircle3 = initCircleDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#fff',
  size: 8,
});
const drawCircle4 = initCircleDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#fff',
  size: 10,
});
const drawSpot = initSpotDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#F27999',
  size: 12,
});
const drawLine = initLineDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#74BF04',
  size: 8,
});
const drawLine2 = initLineDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#F29F05',
  size: 6,
});
const drawCircularLine = initCircularLineDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#F21905',
  size: 8,
});
const drawCircularLine2 = initCircularLineDrawer({
  x: app.screen.width * Math.random(),
  y: app.screen.height * Math.random(),
  color: '#1E5CD9',
  size: 6,
});
