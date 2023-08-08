#version 300 es
precision highp float;

uniform vec3 reverseLightDirection;
uniform vec2 resolution;

in vec4 vPosition;
in vec3 vNormal;

out vec4 fragColor;

void main(void) {
  vec2 p= vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
  vec3 normal = vNormal;
  float light = dot(normal, reverseLightDirection);
  if (light >= .8) {
    fragColor = vec4(1.);
  } else if (light >= .5) {
    if (mod(p.x, 2.0)==0.0) {
      fragColor = vec4(1.);
    } else {
      fragColor = vec4(.0, .0, .0, 1.);
    }
  } else if (light >= .25) {
    if (mod(p.x, 4.0)==0.0) {
      fragColor = vec4(1.);
    } else {
      fragColor = vec4(.0, .0, .0, 1.);
    }
  } else if (light >= .1) {
    if (mod(p.x, 8.0)==0.0) {
      fragColor = vec4(1.);
    } else {
      fragColor = vec4(.0, .0, .0, 1.);
    }
  } else {
    fragColor = vec4(.0, .0, .0, 1.);
  }
}
