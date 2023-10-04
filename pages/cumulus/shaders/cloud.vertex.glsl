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
  vec3 fr=fract(stu);
  
  float a=random(i);
  float b=random(i+vec3(1.,0., 0.));
  float c=random(i+vec3(0.,1., 0.));
  float d=random(i+vec3(1.,1., 0.));
  float e=random(i+vec3(0.,0., 1.));
  float f=random(i+vec3(1.,0., 1.));
  float g=random(i+vec3(0.,1., 1.));
  float h=random(i+vec3(1.,1., 1.));
  
  vec3 u=fr*fr*(3.-2.*fr);

  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  float x3 = mix(e, f, u.x);
  float x4 = mix(g, h, u.x);

  float y1 = mix(x1, x2, u.y);
  float y2 = mix(x3, x4, u.y);

  return mix(y1, y2, u.z);
}

#define OCTAVES 8
float fbm (in vec3 stu) {
  float value = 0.;
  float amplitude = .8;
  float frequency = 1.1;

  for (int i = 0; i < OCTAVES; i++) {
      value += amplitude * noise(frequency * stu);
      stu *= 1.2;
      amplitude *= .7;
  }
  return value;
}

void main(){
  vPosition=mat3(world)*position;
  vNormal=mat3(world)*normal;
  gl_Position=worldViewProjection*vec4(
    position + normal * vec3(fbm(normal + time * 0.001)), 
    1.
  );
}
