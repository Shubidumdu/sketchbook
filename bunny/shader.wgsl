struct VSInput {
  @location(0) pos: vec2f,
}

struct VSOutput {
  @builtin(position) pos: vec4f,
}

@vertex
fn vertexMain(in: VSInput) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.pos = vec4f(in.pos, 1, 1);
  return vsOut;
}

struct Uniforms {
  time: f32,
  resolution: vec2f,
  mouse: vec2f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

const FBM_NUM_OCTAVES = 8;
const SCALE = 2;
const PURPLE = vec3f(0.38823529411, 0.13333333333, 0.58039215686);
const PINK = vec3f(0.40823529411, 0.2333333333, 0.58039215686);
const CYAN = vec3f(0.01176470588, 0.75686274509, 0.9294117647);
const MOUTH = vec3f(0.49411764705, 1, 0.8);
const NOSE = vec3f(0.10588235294, 0.1294117647, 0.45098039215);

@fragment
fn fragmentMain(in: VSOutput) -> @location(0) vec4f {
  let matrix = trs(uniforms.resolution);
  let st = (matrix * in.pos.xyz).xy / uniforms.resolution;
  let mouseSt = (matrix * vec3f(uniforms.mouse, 1.)).xy / uniforms.resolution;
  var color = vec3f(0, 0, 0);
  color += eye(st, mouseSt);
  color += mouth(st);
  color += (
        (1 - (circle(st, vec2f(.75, .3), .15) + circle(st, vec2f(.25, .3), .15))) 
        * (1 - circle(st, vec2f(.5, .5), .125))
      ) * CYAN;
  // color += circle(st, mouseSt, .05) * vec3f(1);
  return vec4f(color, 1);
}

fn trs(res: vec2f) -> mat3x3f {
  if (res.x > res.y) {
    var scale = res.x / res.y;
    var translate = (res.x - res.y) * scale / 2;
    return mat3x3f(scale, 0, 0, 0, 1, 0, -translate, 0, 1);
  } else {
    var scale = res.y / res.x;
    var translate = (res.y - res.x) * scale / 2;
    return mat3x3f(1, 0, 0, 0, scale, 0, 0, -translate, 1);
  }
}

fn circle(st: vec2f, p: vec2f, r: f32) -> f32 {
  return 1 - smoothstep(r - .001, r + .001, length(st - p));
}

fn eyePosition(mouseSt: vec2f, center: vec2f, limit: f32) -> vec2f {
  let dist = length(mouseSt - center);
  if (dist > limit) {
    let n = normalize(mouseSt - center);
    let p = center + n * limit;
    return p;
  } else {
    return mouseSt;
  }
}

fn eye(st: vec2f, mouseSt: vec2f) -> vec3f {
  let eyeHole = circle(st, vec2f(.75, .3), .15) + circle(st, vec2f(.25, .3), .15);
  let outerPupil = circle(st, eyePosition(mouseSt, vec2f(.75, .3), .035), .115) + circle(st, eyePosition(mouseSt, vec2f(.25, .3), .035), .115);
  let innerPupil = circle(st, eyePosition(mouseSt, vec2f(.75, .3), .0375), .08) + circle(st, eyePosition(mouseSt, vec2f(.25, .3), .0375), .08);
  let highLight = circle(st, eyePosition(mouseSt, vec2f(.75, .3), .0375) + vec2f(.06, .05), .02) 
                + circle(st, eyePosition(mouseSt, vec2f(.25, .3), .0375) + vec2f(.06, .05), .02);
  let f = fbm(st * 5.0);
  let f2 = fbm(st + f + uniforms.time * 0.0001);
  var color = vec3f(0);
  color += (eyeHole * (1 - outerPupil)) * vec3f(1);
  color += (outerPupil * (1 - innerPupil)) * PURPLE;
  color += highLight * vec3f(1);
  return color;
}

fn teeth(st: vec2f) -> vec3f {
  if (st.x > 1. || st.x < -1.) {
    return vec3f(0);
  } else {
    let teeth = smoothstep(0, .05, cos(pow(st.x, 2) * 2) * .6 - st.y - .1);
    return teeth * vec3f(1);
  }
}

fn mouth(st: vec2f) -> vec3f {
  let highLight = circle(st, vec2f(.53, .4425), .01);
  let mouth = circle(st, vec2f(.5, .5), .125);
  let nose = circle(st * vec2f(.8, 1.), vec2f(.5, .44) * vec2f(.8, 1.), .05);
  let arc = smoothstep(1., 1.05, sqrt(sin(st.x * 24 + .5)) - st.y * 26 + 13.75) 
            - smoothstep(1.05, 1.1, sqrt(sin(st.x * 24 + .5)) - st.y * 26 + 13.75 - .1) 
            + smoothstep(1., 1.05, sqrt(sin(st.x * 24 - 21.5)) - st.y * 26 + 13.75) 
            - smoothstep(1.05, 1.1, sqrt(sin(st.x * 24 - 21.5)) - st.y * 26 + 13.75 - .1);
  let teeth = (1 - (smoothstep(1., 1.05, sqrt(sin(st.x * 24 + .5)) - st.y * 26 + 13.75) 
            + smoothstep(1., 1.05, sqrt(sin(st.x * 24 - 21.5)) - st.y * 26 + 13.75))) 
            * teeth(st * 10 - vec2f(5, 5.5)) * step(.0, -.49 + st.y);
  let teethLine = (smoothstep(.501, .502, st.x) - smoothstep(.504, .505, st.x)) * step(.0, -.492 + st.y);
  var color = vec3f(0);
  color += (mouth * (1 - nose) * (1 - arc) * (1 - teeth)) * MOUTH;
  color += (mouth * (1 - nose) * (1 - teeth)) * arc * (MOUTH - .4) * .8;
  color += nose * NOSE;
  color += (teeth * (1 - teethLine)) * vec3f(1);
  color += teeth * teethLine * vec3f(.85);
  color += highLight * vec3f(1);
  return color;
}

fn random(st: vec2f) -> f32 {
  return fract(sin(dot(st.xy, vec2f(12.9898,78.233))) * 43758.5453123);
}

fn noise(st: vec2f) -> f32 {
  let i = floor(st);
  let f = fract(st);
  let a = random(i);
  let b = random(i + vec2f(1, 0));
  let c = random(i + vec2f(0, 1));
  let d = random(i + vec2f(1, 1));
  let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

fn fbm(_st: vec2f) -> f32 {
  var value = 0.0;
  var amplitude = .5;
  var st = _st;
  for (var i = 0; i < FBM_NUM_OCTAVES; i = i + 1) {
    value += amplitude * noise(st);
    st = rotate(st * 4.0, .5);
    amplitude *= 0.5;
  }
  return value;
}

fn rotate(_st: vec2f, _angle: f32) -> vec2f {
  let ca = cos(_angle);
  let sa = sin(_angle);
  let st = vec2f(ca * _st.x - sa * _st.y, sa * _st.x + ca * _st.y);
  return st;
}
