#version 300 es
precision highp float;

uniform vec3 cameraPosition;
uniform vec3 surfaceColor;
uniform vec3 warmColor;
uniform vec3 coolColor;
uniform vec3 highlightColor;
uniform vec3 lightPosition;
uniform vec3 lightColor;

in vec3 vPosition;
in vec3 vNormal;

out vec4 outColor;

vec3 lit(vec3 l,vec3 n,vec3 v){
  vec3 rl=reflect(-l,n);
  vec3 c=warmColor+.25*surfaceColor;
  float s=clamp(100.*dot(rl,v)-97.,0.,1.);
  return mix(c,highlightColor,s);
}

vec3 unlit(){
  vec3 c=coolColor+.25*surfaceColor;
  return c*.5;
}

void main(){
  vec3 unlitColor=unlit();
  outColor=vec4(unlitColor,1.);
  vec3 n=normalize(vNormal);
  vec3 v=normalize(cameraPosition-vPosition);
  vec3 l=normalize(lightPosition-vPosition);
  float dl=clamp(dot(n,l),0.,1.);
  outColor.rgb+=dl*lightColor*lit(l,n,v);
}
