struct VSInput {
  @location(0) pos: vec2f,
}

struct VSOutput {
  @builtin(position) pos: vec4f,
}

@vertex
fn vertexMain(in: VSInput) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.pos = vec4f(in.pos, 1, 1);
  return vsOut;
}

@fragment
fn fragmentMain(in: VSOutput) -> @location(0) vec4f {

  return vec4f(vec3f(1.), 1.);
}
