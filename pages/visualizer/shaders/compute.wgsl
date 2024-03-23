struct Uniforms {
  deltaTime: f32,
  radius: f32,
  particleCount: u32,
  time: f32,
  high: f32,
  mid: f32,
  low: f32,
}

struct Particle {
  position: vec3<f32>,
  velocity: vec3<f32>,
  noise: f32,
  acceleration: vec3<f32>,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;
@binding(1) @group(0) var<storage, read_write> particles: array<Particle>;

const core = vec3(0., 0., 0.);

@compute @workgroup_size(64, 1, 1) fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>
) {  
  let index: u32 = globalId.x;

  if (index >= uniforms.particleCount) {
    return;
  }

  let time = uniforms.time * 0.02;
  let high = uniforms.high / 255.;
  let mid = uniforms.mid / 255.;
  let low = uniforms.low / 255.;
  let speed = uniforms.deltaTime * 0.002;
  let rotateYMatrix = mat3x3(vec3(cos(speed), 0, -sin(speed)), vec3(0., 1., 0.), vec3(sin(speed), 0, cos(speed)));
  let radius = uniforms.radius;
  let position = particles[index].position;
  let noise = fbm3d((vec3(1. + .2 * low, 1. + .2 * mid, 1. + .2 * high) * position.xyz * .4 + vec3(0, time, 0)) * .3);
  let nPosition = normalize(position - core);
  let velocity = (rotateYMatrix * (nPosition * radius) - position) * .05;

  particles[index].noise = noise;
  particles[index].position += velocity;
}

fn mod289(x: vec4f) -> vec4f { return x - floor(x * (1. / 289.)) * 289.; }
fn perm4(x: vec4f) -> vec4f { return mod289(((x * 34.) + 1.) * x); }

fn noise3(p: vec3f) -> f32 {
    let a = floor(p);
    var d: vec3f = p - a;
    d = d * d * (3. - 2. * d);

    let b = a.xxyy + vec4f(0., 1., 0., 1.);
    let k1 = perm4(b.xyxy);
    let k2 = perm4(k1.xyxy + b.zzww);

    let c = k2 + a.zzzz;
    let k3 = perm4(c);
    let k4 = perm4(c + 1.);

    let o1 = fract(k3 * (1. / 41.));
    let o2 = fract(k4 * (1. / 41.));

    let o3 = o2 * d.z + o1 * (1. - d.z);
    let o4 = o3.yw * d.x + o3.xz * (1. - d.x);

    return o4.y * d.y + o4.x * (1. - d.y);
}

const m3: mat3x3f = mat3x3f(vec3f(0.8, 0.6, 0.4), vec3f(-0.6, 0.8, 0.4), vec3f(0.1, 0.2, 0.3));

fn fbm3d(_p: vec3f) -> f32 {
  var f: f32 = 0.;
  var p: vec3f = _p;
  f = f + 0.5000 * noise3(p); p = m3 * p * 2.02;
  f = f + 0.2500 * noise3(p); p = m3 * p * 2.03;
  f = f + 0.1250 * noise3(p); p = m3 * p * 2.01;
  f = f + 0.0625 * noise3(p);
  return f / 0.9375;
}
