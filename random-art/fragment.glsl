#version 300 es

precision highp float;

out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;

float random(vec2 st){
  return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main(){
  float r_size=min(u_resolution.x,u_resolution.y)/24.;
  vec2 st=gl_FragCoord.xy/r_size;
  // st*=10.;// Scale the coordinate system by 10
  vec2 ipos=floor(st);// get the integer coords
  vec3 color=vec3(1.,1.,1)*random(ipos);
  outColor=vec4(color,1.);
}
