struct VSInput {
  @location(0) pos: vec2f,
  @builtin(vertex_index) vertexIndex: u32
}

struct VSOutput {
  @builtin(position) pos: vec4f,
}

struct Uniforms {
  time: f32,
  pointSize: f32,
  resolution: vec2f,
  mousePosition: vec2f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(in: VSInput) -> VSOutput {
  let pointSize = vec2f(uniforms.pointSize) / uniforms.resolution;
  var vsOut: VSOutput;
  if (in.vertexIndex == 0) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x - pointSize.x / 2.,
        in.pos.y + pointSize.y / 2.,
      ), 
      1, 
      1
    );
  } 
  if (in.vertexIndex == 1) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x - pointSize.x / 2.,
        in.pos.y - pointSize.y / 2.,
      ), 
      1, 
      1
    );
  }
  if (in.vertexIndex == 2) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x + pointSize.x / 2.,
        in.pos.y + pointSize.y / 2.,
      ), 
      1, 
      1
    );
  }
  if (in.vertexIndex == 3) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x + pointSize.x / 2.,
        in.pos.y - pointSize.y / 2.,
      ), 
      1, 
      1
    );
  }
  return vsOut;
}

@fragment
fn fragmentMain(in: VSOutput) -> @location(0) vec4f {

  return vec4f(vec3f(1.), 1.);
}
