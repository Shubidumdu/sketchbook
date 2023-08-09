#version 300 es
precision highp float;

uniform vec3 reverseLightDirection;
uniform vec2 resolution;
uniform vec3 mainColor;
uniform vec3 subColor;

in vec4 vPosition;
in vec3 vNormal;

out vec4 fragColor;

void fill(vec2 p, float light) {
  if (light >= .8) {
    fragColor = vec4(mainColor, 1.);
  } else if (light >= .5) {
    if (mod(p.x - p.y, 2.0)==0.0) {
      fragColor = vec4(mainColor, 1.);
    } else {
      fragColor = vec4(subColor, 1.);
    }
  } else if (light >= .2) {
    if (mod(p.x - p.y, 4.0)==0.0) {
      fragColor = vec4(mainColor, 1.);
    } else {
      fragColor = vec4(subColor, 1.);
    }
  } else if (light >= .1) {
    if (mod(p.x - p.y, 8.0)==0.0) {
      fragColor = vec4(mainColor, 1.);
    } else {
      fragColor = vec4(subColor, 1.);
    }
  } else {
    fragColor = vec4(subColor, 1.);
  }
}

void main(void) {
  vec2 p= vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
  vec3 normal = vNormal;
  float light = dot(normal, reverseLightDirection);
  fill(p, light);
}
