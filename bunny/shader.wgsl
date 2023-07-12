struct VSInput {
  @location(0) pos: vec2f,
}

struct VSOutput {
  @builtin(position) pos: vec4f,
}

@vertex
fn vertexMain(in: VSInput) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.pos = vec4f(in.pos, 0, 1);
  return vsOut;
}

struct Uniforms {
  time: f32,
  resolution: vec2f,
  mouse: vec2f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

const SCALE = 2;
const FBM_NUM_OCTAVES = 8;
const PURPLE = vec3f(0.38823529411, 0.13333333333, 0.58039215686);
const PINK = vec3f(0.40823529411, 0.2333333333, 0.58039215686);
const CYAN = vec3f(0.01176470588, 0.75686274509, 0.9294117647);

@fragment
fn fragmentMain(in: VSOutput) -> @location(0) vec4f {
  let st = in.pos.xy / uniforms.resolution;
  let mouseSt = uniforms.mouse / uniforms.resolution;
  var color = vec3f(0, 0, 0);
  color += eye(st);

  return vec4f(color, 1);
}

fn circle(st: vec2f, p: vec2f, r: f32) -> f32 {
  return 1 - smoothstep(r - .001, r + .001, length(st - p));
}

fn eye(st: vec2f) -> vec3f {
  let eyeHole = circle(st, vec2f(.75, .3), .15) + circle(st, vec2f(.25, .3), .15);
  let outerPupil = circle(st, vec2f(.75, .3), .125) + circle(st, vec2f(.25, .3), .125);
  let innerPupil = circle(st, vec2f(.75, .3), .08) + circle(st, vec2f(.25, .3), .08);
  let light = (1 - min(.5, length(st - vec2f(.8, .325)) * 2)) * 1.5 * (1 - min(.5, length(st - vec2f(.35, .325)) * 2)) * 1.5;
  let highLight = circle(st, vec2f(.81, .35), .02) + circle(st, vec2f(.31, .35), .02);
  let f = fbm(st * 5.0);
  let f2 = fbm(st + f + uniforms.time * 0.0001);
  var color = vec3f(0);
  color += (eyeHole * (1 - outerPupil)) * vec3f(1) * light;
  color += (outerPupil * (1 - innerPupil)) * (PURPLE * light * f * 2 + vec3f(1.) * f2 * f2 * f);
  color += (outerPupil * (1 - innerPupil)) * sin(noise(st * 1200)) * vec3f(.5) * .4;
  color *= (1 - outerPupil * (smoothstep(.115, .125, distance(st, vec2f(.75, .3))) * smoothstep(.115, .125, distance(st, vec2f(.25, .3))))) * light;
  color += innerPupil * vec3f(.12) * light;
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
