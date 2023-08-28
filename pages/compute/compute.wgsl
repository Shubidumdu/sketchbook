struct Agent {
  angle: f32,
  speed: f32
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec2f>;
@group(0) @binding(1) var<storage, read_write> agent: array<Agent>;

@compute @workgroup_size(64, 1, 1) fn computeMain(
  @builtin(local_invocation_id) localId : vec3<u32>,
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let angle = agent[globalId.x].angle;
  let speed = agent[globalId.x].speed;
  positions[globalId.x].x += rotate(angle, positions[globalId.x]).x * speed;
  positions[globalId.x].y += rotate(angle, positions[globalId.x]).y * speed;
}

// [[cos(a), -sin(a)], [sin(a), cos(a)]
//
fn rotate(angle: f32, position: vec2f) -> vec2f {
  let x = position.x * cos(angle) - position.y * sin(angle);
  let y = position.x * sin(angle) + position.y * cos(angle);
  return vec2f(x, y);
}
