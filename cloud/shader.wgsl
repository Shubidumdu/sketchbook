struct VSInput {
  @location(0) pos: vec2f,
}

struct VSOutput {
  @builtin(position) pos: vec4f,
}

@vertex
fn vertexMain(v: VSInput) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.pos = vec4f(v.pos, 0, 1);
  return vsOut;
}

struct Uniforms {
  time: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn fragmentMain(f: VSOutput) -> @location(0) vec4f {
  var color = vec4f(0.5 + 0.5 * cos(uniforms.time / 1000), 0, 0, 1);
  return color;
}
