import { createNoise2D } from 'simplex-noise';
import './style.scss';
import {
  Application,
  BlurFilter,
  Graphics,
  RenderTexture,
  Sprite,
} from 'pixi.js';
import { HashGenerator } from '../../utils/hash';

const searchParams = new URLSearchParams(location.search);
const seed = Number(searchParams.get('seed')) | 0;
const hasher = new HashGenerator(seed);

const seedBtn = document.getElementById('seed')!;
seedBtn.addEventListener('click', () => {
  const newSeed = prompt('Please enter a seed number.', '0');
  const parsed = Number(newSeed);
  if (isNaN(parsed)) {
    alert("It's not a number.");
    return;
  }
  window.location.replace(`?seed=${parsed}`);
});

const app = new Application({
  background: hasher.hexColor(),
  resizeTo: window,
});

document.body.append(app.view as HTMLCanvasElement);

const graphics = new Graphics();

graphics.filters = [new BlurFilter(0.2)];

const renderTexture = RenderTexture.create({
  width: app.screen.width,
  height: app.screen.height,
});
const outputSprite = new Sprite(renderTexture);

app.stage.addChild(outputSprite);
app.stage.addChild(graphics);

let time = 0;

const noise2D = createNoise2D(() => hasher.distribute(0, 1));

app.ticker.add((delta) => {
  time += delta / 24;
  drawers.forEach((draw) => draw());

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
      x = hasher.distribute(0, app.screen.width);
    }
    if (y < 0 || y > app.screen.height) {
      y = hasher.distribute(0, app.screen.height);
    }
    (x += noise2D(x + 1, y) * 24), (y += noise2D(x, y + 1) * 24);
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
      x = hasher.distribute(0, app.screen.width);
      y = hasher.distribute(0, app.screen.height);
      startTime = time;
      return;
    }
    (x += noise2D(x + 1, y) * 8), (y += noise2D(x, y + 1) * 8);
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
  let radian = hasher.distribute(0, Math.PI * 2);
  let resultRandom = hasher.distribute(0, 0.5);

  return () => {
    const progress = (time - startTime) / 2;
    if (progress > Math.PI / 2) {
      x = hasher.distribute(0, app.screen.width);
      y = hasher.distribute(0, app.screen.height);
      startTime = time;
      radian = hasher.distribute(0, Math.PI * 2);
      return;
    }
    const randomValue = hasher.distribute(0, 0.5);
    x +=
      (Math.cos(radian) - Math.sin(radian)) *
      Math.cos(time + randomValue * 2) *
      4;
    y +=
      (Math.sin(radian) + Math.sin(radian)) *
      Math.sin(time + randomValue * 2) *
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
  let resultRandom = hasher.distribute(0, 0.5);
  let radian = hasher.distribute(0, Math.PI * 2);

  return () => {
    const progress = (time - startTime) / 2;
    if (progress > Math.PI) {
      x = hasher.distribute(0, app.screen.width);
      y = hasher.distribute(0, app.screen.height);
      startTime = time;
      resultRandom = hasher.distribute(0, 0.5);
      radian = hasher.distribute(0, Math.PI * 2);
      return;
    }
    const randomValue = hasher.distribute(0, 0.5);
    x +=
      (Math.cos(radian) - Math.sin(radian)) *
      Math.cos(time + randomValue * 4) *
      4;
    y +=
      (Math.sin(radian) + Math.sin(radian)) *
      Math.sin(time + randomValue * 4) *
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

type DRAWER_TYPE = 1 | 2 | 3 | 4;

const MAX_DRAWER_COUNT = 48;
const DRAWER_TYPE_COUNT = 4;

const initDrawers = () => {
  return [...new Array(hasher.distributeInt(0, MAX_DRAWER_COUNT))].map(() => {
    const type = hasher.distributeInt(1, DRAWER_TYPE_COUNT) as DRAWER_TYPE;
    switch (type) {
      case 1:
        return initCircleDrawer({
          x: hasher.distribute(0, app.screen.width),
          y: hasher.distribute(0, app.screen.height),
          color: hasher.hexColor(),
          size: hasher.distribute(4, 18),
        });
      case 2:
        return initSpotDrawer({
          x: hasher.distribute(0, app.screen.width),
          y: hasher.distribute(0, app.screen.height),
          color: hasher.hexColor(),
          size: hasher.distribute(4, 20),
        });
      case 3:
        return initLineDrawer({
          x: hasher.distribute(0, app.screen.width),
          y: hasher.distribute(0, app.screen.height),
          color: hasher.hexColor(),
          size: hasher.distribute(4, 18),
        });
      case 4:
        return initCircularLineDrawer({
          x: hasher.distribute(0, app.screen.width),
          y: hasher.distribute(0, app.screen.height),
          color: hasher.hexColor(),
          size: hasher.distribute(4, 18),
        });
    }
  });
};

const drawers = initDrawers();
