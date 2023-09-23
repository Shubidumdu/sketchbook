#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;

uniform mat4 world;
uniform mat4 worldViewProjection;
uniform vec3 pointerRay;
uniform float clickedTime;

out vec4 outColor;

const vec3 lightPosition=vec3(1.,1.,1.);

const float rayThreshold=.99;

void main(){
  vec3 n=normalize(vNormal);
  vec3 v=normalize(vPosition);
  vec3 l=normalize(lightPosition);
  vec3 r=normalize(pointerRay);
  float light=dot(n,l);
  outColor=vec4(vec3(0.125, .196, .4078),1.);
  outColor+=vec4(mix(vec3(.6,.6,.6),vec3(1.),light),1.);
}
