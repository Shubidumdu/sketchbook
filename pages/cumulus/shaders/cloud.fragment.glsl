#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;

uniform mat4 world;
uniform mat4 worldViewProjection;

out vec4 outColor;

const vec3 lightPosition=vec3(0.,1,0.5);
const vec3 lightPosition2=vec3(0,-1.,0.);

void main(){
  vec3 n=normalize(vNormal);
  vec3 v=normalize(vPosition);
  vec3 l=normalize(lightPosition);
  vec3 l2=normalize(lightPosition2);
  float light=dot(n,l);
  float light2=dot(n,l2);
  outColor=vec4(vec3(0.125, .196, .4078),1.);
  outColor+=vec4(mix(vec3(.6,.6,.6),vec3(1.),light),1.);
  outColor.rgb+=vec3(.1,.1,.2)*light2;
}
