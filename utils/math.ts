export const degreeToRadian = (degree: number) => {
  return degree * (Math.PI / 180);
};

export const radianToDegree = (radian: number) => {
  return radian * (180 / Math.PI);
};

type Matrix3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export const matrix3 = {
  translation: (tx: number, ty: number): Matrix3 => [
    1,
    0,
    0,
    0,
    1,
    0,
    tx,
    ty,
    1,
  ],
  rotation: (radian: number): Matrix3 => [
    Math.cos(radian),
    Math.sin(radian),
    0,
    -Math.sin(radian),
    Math.cos(radian),
    0,
    0,
    0,
    1,
  ],
  scaling: (sx: number, sy: number): Matrix3 => [sx, 0, 0, 0, sy, 0, 0, 0, 1],
  identity: (): Matrix3 => [1, 0, 0, 0, 1, 0, 0, 0, 1],
  projection: (width: number, height: number): Matrix3 => [
    2 / width,
    0,
    0,
    0,
    -2 / height,
    0,
    -1,
    1,
    1,
  ],
  multiply: function multiply(a: Matrix3, b: Matrix3): Matrix3 {
    const a00 = a[0 * 3 + 0];
    const a01 = a[0 * 3 + 1];
    const a02 = a[0 * 3 + 2];
    const a10 = a[1 * 3 + 0];
    const a11 = a[1 * 3 + 1];
    const a12 = a[1 * 3 + 2];
    const a20 = a[2 * 3 + 0];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];
    const b00 = b[0 * 3 + 0];
    const b01 = b[0 * 3 + 1];
    const b02 = b[0 * 3 + 2];
    const b10 = b[1 * 3 + 0];
    const b11 = b[1 * 3 + 1];
    const b12 = b[1 * 3 + 2];
    const b20 = b[2 * 3 + 0];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
  translate: (m: Matrix3, tx: number, ty: number): Matrix3 => {
    return matrix3.multiply(m, matrix3.translation(tx, ty));
  },
  rotate: (m: Matrix3, radian: number): Matrix3 => {
    return matrix3.multiply(m, matrix3.rotation(radian));
  },
  scale: (m: Matrix3, sx: number, sy: number): Matrix3 => {
    return matrix3.multiply(m, matrix3.scaling(sx, sy));
  },
};

type Matrix4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export const matrix4 = {
  translation: (tx: number, ty: number, tz: number): Matrix4 => [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    tx,
    ty,
    tz,
    1,
  ],
  xRotation: (radian: number): Matrix4 => {
    const c = Math.cos(radian);
    const s = Math.sin(radian);
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  },
  yRotation: (radian: number): Matrix4 => {
    const c = Math.cos(radian);
    const s = Math.sin(radian);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },
  zRotation: (radian: number): Matrix4 => {
    const c = Math.cos(radian);
    const s = Math.sin(radian);
    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },
  scaling: (sx: number, sy: number, sz: number): Matrix4 => [
    sx,
    0,
    0,
    0,
    0,
    sy,
    0,
    0,
    0,
    0,
    sz,
    0,
    0,
    0,
    0,
    1,
  ],
  identity: (): Matrix4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  ZtoWMatrix: (fudgeFactor: number): Matrix4 => [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    fudgeFactor,
    0,
    0,
    0,
    1,
  ],
  multiply: function multiply(a: Matrix4, b: Matrix4): Matrix4 {
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },
  projection: (width: number, height: number, depth: number): Matrix4 => {
    return [
      2 / width,
      0,
      0,
      0,
      0,
      -2 / height,
      0,
      0,
      0,
      0,
      2 / depth,
      0,
      -1,
      1,
      0,
      1,
    ];
  },
  perspective: (
    fov: number,
    aspect: number,
    near: number,
    far: number,
  ): Matrix4 => {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    const rangeInv = 1.0 / (near - far);

    return [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ];
  },
  orthographic: (
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
  ): Matrix4 => {
    return [
      2 / (right - left),
      0,
      0,
      0,
      0,
      2 / (top - bottom),
      0,
      0,
      0,
      0,
      2 / (near - far),
      0,
      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ];
  },
  translate: (m: Matrix4, tx: number, ty: number, tz: number): Matrix4 => {
    return matrix4.multiply(m, matrix4.translation(tx, ty, tz));
  },
  xRotate: (m: Matrix4, radian: number): Matrix4 => {
    return matrix4.multiply(m, matrix4.xRotation(radian));
  },
  yRotate: (m: Matrix4, radian: number): Matrix4 => {
    return matrix4.multiply(m, matrix4.yRotation(radian));
  },
  zRotate: (m: Matrix4, radian: number): Matrix4 => {
    return matrix4.multiply(m, matrix4.zRotation(radian));
  },
  scale: (m: Matrix4, sx: number, sy: number, sz: number): Matrix4 => {
    return matrix4.multiply(m, matrix4.scaling(sx, sy, sz));
  },
};
