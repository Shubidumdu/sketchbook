#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec3 color;

uniform mat4 world;
uniform mat4 worldViewProjection;

out vec3 vPosition;
out vec3 vNormal;
out vec3 vColor;

void main(){
  vec4 p=vec4(position,1.);
  gl_Position=worldViewProjection*p;
  vNormal=mat3(world)*normal;
  vPosition=vec3(world*p);
  vColor=color;
}
