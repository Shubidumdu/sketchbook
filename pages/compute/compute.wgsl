struct Agent {
  angle: f32,
  speed: f32
}

@group(0) @binding(0) var<storage, read_write> position: array<vec2f>;
@group(0) @binding(1) var<storage, read_write> agent: array<Agent>;

@compute @workgroup_size(64, 1, 1) fn computeMain(
  @builtin(local_invocation_id) localId : vec3<u32>,
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let angle = agent[globalId.x].angle;
  let speed = agent[globalId.x].speed;
  position[globalId.x].x += 0.001;
  position[globalId.x].y += 0.001;
}
