struct VSInput {
  @location(0) position: vec2f,
  @builtin(vertex_index) vertexIndex: u32
}

struct VSOutput {
  @builtin(position) position: vec4f,
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
  let vertexPosition = getVertexPosition(in.position, in.vertexIndex);
  var vsOut: VSOutput;
  vsOut.position = vec4f(vertexPosition, 1., 1.);
  return vsOut;
}

fn getVertexPosition(center: vec2f, vertexIndex: u32) -> vec2f {
  let pointSize = vec2f(uniforms.pointSize) / uniforms.resolution;
  let quadPosition = array(
      vec2f(-.5, .5),
      vec2f(-.5, -.5),
      vec2f(.5, .5),
      vec2f(.5, -.5),
    );
  let pos = center + quadPosition[vertexIndex] * pointSize;
  return pos;
}

@fragment
fn fragmentMain(in: VSOutput) -> @location(0) vec4f {

  return vec4f(vec3f(.8), 1.);
}
