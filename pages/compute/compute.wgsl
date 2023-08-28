struct Agent {
  angle: f32,
  speed: f32
}

struct Uniforms {
  deltaTime: f32,
  mousePosition : vec2f,
  resolution: vec2f,
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec2f>;
@group(0) @binding(1) var<storage, read_write> agent: array<Agent>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(64, 1, 1) fn computeMain(
  @builtin(local_invocation_id) localId : vec3<u32>,
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let deltaTime = uniforms.deltaTime;
  let resolution = uniforms.resolution;
  let mousePosition = (uniforms.mousePosition * 2. - resolution) / resolution;
  let angle = agent[globalId.x].angle;
  let speed = agent[globalId.x].speed;
  var circleSize = vec2f(320.) / resolution;
  positions[globalId.x].x += rotate(angle, (positions[globalId.x] - mousePosition + circleSize)).x * speed * deltaTime;
  positions[globalId.x].y += rotate(angle, (positions[globalId.x] - mousePosition - circleSize)).y * speed * deltaTime;
}

fn rotate(angle: f32, position: vec2f) -> vec2f {
  let resolution = uniforms.resolution;
  var ratio = max(resolution.x, resolution.y) / min(resolution.x, resolution.y);
  if (resolution.x > resolution.y) {
    ratio = 1. / ratio;
  }
  let x = position.x * 1 / ratio * cos(angle) - position.y * sin(angle) * ratio;
  let y = position.x * ratio * sin(angle) + position.y * cos(angle) * ratio;
  return vec2f(x, y);
}
