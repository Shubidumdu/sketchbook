struct VSInput {
  @location(0) pos: vec2f,
  @builtin(vertex_index) vertexIndex: u32
}

struct VSOutput {
  @builtin(position) pos: vec4f,
}

@vertex
fn vertexMain(in: VSInput) -> VSOutput {
  var vsOut: VSOutput;
  if (in.vertexIndex == 0) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x - .1,
        in.pos.y + .1,
      ), 
      1, 
      1
    );
  } 
  if (in.vertexIndex == 1) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x - .1,
        in.pos.y - .1,
      ), 
      1, 
      1
    );
  }
  if (in.vertexIndex == 2) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x + .1,
        in.pos.y + .1,
      ), 
      1, 
      1
    );
  }
  if (in.vertexIndex == 3) {
    vsOut.pos = vec4f(
      vec2f(
        in.pos.x + .1,
        in.pos.y - .1,
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
