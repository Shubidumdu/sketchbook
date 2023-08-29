struct Particle {
  angle: f32,
  speed: f32
}

struct Uniforms {
  deltaTime: f32,
  mousePosition : vec2f,
  resolution: vec2f,
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec2f>;
@group(0) @binding(1) var<storage, read_write> particle: array<Particle>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(64, 1, 1) fn computeMain(
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let deltaTime = uniforms.deltaTime * .5;
  let resolution = uniforms.resolution;
  let mousePosition = (uniforms.mousePosition * 2. - resolution) / resolution;
  let angle = particle[globalId.x].angle;
  let speed = particle[globalId.x].speed;
  positions[globalId.x] += transform(angle, (positions[globalId.x] - mousePosition)) * speed * deltaTime;
  particle[globalId.x].angle += 0.0001 * deltaTime;
}

fn transform(angle: f32, position: vec2f) -> vec2f {
  let resolution = uniforms.resolution;
  let ratio = resolution.x / resolution.y;
  let size = .125;
  let x = ratio * cos(angle) * (position.x + size) - sin(angle) * (position.y + size) - size;
  let y = ratio * sin(angle) * (position.x - size) + cos(angle) * (position.y - size) + size;
  return vec2f(x, y);
}
