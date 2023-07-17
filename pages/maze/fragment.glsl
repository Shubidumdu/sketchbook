#version 300 es

precision highp float;

out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;

mat2 rotate2d(float angle){
  return mat2(cos(angle),-sin(angle),
  sin(angle),cos(angle));
}

float random(vec2 st){
  return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43458.5453123);
}

vec2 pattern(vec2 ipos,vec2 fpos){
  float _random=random(ipos);
  vec2 _st;
  if(_random>.75){
    _st=vec2(0.,fpos.y);
  }else if(_random>.5){
    _st=vec2(fpos.x,0.);
  }else if(_random>.25){
    _st=vec2(fpos.x*.5,fpos.y*.5)*2.;
  }else{
    _st=vec2(fpos.x*.5+.5,-fpos.y*.5)*2.;
  }
  return _st;
}

void main(){
  float r_size=min(u_resolution.x,u_resolution.y)/12.;
  vec2 st=(gl_FragCoord.xy*2.-u_resolution.xy)/2./r_size;// -1.0~1.0
  float dist=distance(st,vec2(0.))/12.;
  st=rotate2d(radians(45.)*u_time*.1)*st;
  vec2 ipos=floor(st);// integer
  vec2 fpos=fract(st);// fraction
  vec2 tile=pattern(ipos,fpos);
  float color;
  color=step(.1,fract((tile.x+tile.y-u_time*.5)*2.));
  outColor=vec4(vec3(color,color+dist,color-dist),1.);
}
