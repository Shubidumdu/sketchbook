struct Uniforms {
  deltaTime: f32,
  radius: f32,
  particleCount: u32,
}

struct Particle {
  position: vec3<f32>,
  velocity: vec3<f32>,
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

  let speed = uniforms.deltaTime * 0.001;
  let radius = uniforms.radius;
  let position = particles[index].position;
  let velocity = normalize(position - core) * radius - position;

  particles[index].position += velocity * speed;
}