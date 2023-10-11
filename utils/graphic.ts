export const random = (x: number) => {
  const f = (Math.sin(x) * 40512319.5453) % 1;
  return f;
};

export const mix = (a: number, b: number, t: number) => {
  return a * (1 - t) + b * t;
};

export const noise = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);

  const y1 = random(i);
  const y2 = random(i + 1);

  return mix(y1, y2, u);
};
