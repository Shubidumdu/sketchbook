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

@fragment
fn fragmentMain(f: VSOutput) -> @location(0) vec4f {
  var color = vec4f(1, 0, 0, 1);
  return color;
}
