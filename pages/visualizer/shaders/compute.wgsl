struct Uniforms {
  deltaTime: f32,
  particleCount: u32,
}

struct Particle {
  position: vec3<f32>,
  // direction: vec3<f32>,
  // velocity: vec3<f32>,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;
@binding(1) @group(0) var<storage, read_write> particles: array<Particle>;

@compute @workgroup_size(64, 1, 1) fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let index: u32 = globalId.x;

  if (index >= uniforms.particleCount) {
    return;
  }

  particles[globalId.x].position.x += uniforms.deltaTime;
}