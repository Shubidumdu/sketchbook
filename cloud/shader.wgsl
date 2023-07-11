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

@fragment
fn fragmentMain(in: VSOutput) -> @location(0) vec4f {
  let st = in.pos.xy / uniforms.resolution;
  let mouseSt = uniforms.mouse / uniforms.resolution;
  var color = vec3f(0, 0, 0);
  var horizon = horizon(st);
  let q = fbm(vec2f(st.x * 4. + uniforms.time * 0.0001, st.y * 4.));
  let r = fbm(vec2f(st.x * 8. + uniforms.time * 0.0005, st.y * 12.));
  let f = fbm(st + r);
  color += (1 - horizon) * smoothstep(0, 1, st.y) * vec3f(.8, .8, .8);
  color += (1 - horizon) * smoothstep(0, 1, 1 - st.y) * vec3f(0.2, 0.4, 0.4);
  color += q * vec3f(.25, .2, .2);
  color += vec3f(.2, .2, .4);
  color += smoothstep(.1, .8, r) * vec3f(.3, .3, .3) * f;
  color += smoothstep(.4, .6, r) * vec3f(.6, .6, .6) * f * f * f;
  color += smoothstep(.6, .8, r) * vec3f(.6, .6, .6) * f * f * f * f;
  color += smoothstep(.8, 1., r) * vec3f(.6, .6, .6) * f * f * f * f * f;
  return vec4f(color, 1.0);
}

fn horizon(st: vec2f) -> f32 {
  let amplitude = .5;
  let frequency = 24.;
  let time = uniforms.time / 100;
  var noise = sin(st.x * frequency) + .2;
  noise += sin(st.x*frequency*.1 + time)*4.5;
  noise += sin(st.x*frequency*1.72 + time*1.121)*4.0;
  noise += sin(st.x*frequency*.5122+ time*.169)*2.5;
  noise *= amplitude * 0.0001;
  return smoothstep(1 - st.y, 1, noise);
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
    st = rotate(st * 2.0, 0.5);
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
