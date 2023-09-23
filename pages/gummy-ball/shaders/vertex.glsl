#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;

uniform mat4 world;
uniform mat4 worldViewProjection;
uniform float time;

out vec3 vPosition;
out vec3 vNormal;


float random(in vec3 stu){
  return fract(sin(dot(stu,
    vec3(12.9898,78.233, 0.22)))*
    43758.5453123);
}
    
float noise(in vec3 stu){
  vec3 i=floor(stu);
  vec3 f=fract(stu);
  
  float a=random(i);
  float b=random(i+vec3(1.,1., 0.));
  float c=random(i+vec3(0.,1., 1.));
  float d=random(i+vec3(1.,0., 1.));
  
  vec3 u=f*f*(3.-2.*f);
  
  return mix(a,b,u.x)+
  (c-a)*u.y*(1.-u.x)+
  (d-b)*u.x*u.y;
}

#define OCTAVES 8
float fbm (in vec3 stu) {
    float value = 0.0;
    float amplitude = .8;
    float frequency = 0.;

    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(stu);
        stu *= 1.5;
        amplitude *= .6;
    }
    return value;
}

void main(){
  vPosition=mat3(world)*position;
  vNormal=mat3(world)*normal;
  gl_Position=worldViewProjection*vec4(
    position + normal * vec3(fbm(normal + time * 0.0006)), 
    1.
  );
}
