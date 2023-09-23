varying vec2 vUV;
uniform sampler2D textureSampler;

const float scale=2.;
const float halfScaleFloor=floor(scale*.5);
const float halfScaleCeil=ceil(scale*.5);
const vec3 lightPosition=vec3(0.,.5,-8.);

uniform vec2 screenSize;

void main(void)
{
  vec4 baseColor=texture2D(textureSampler,vUV);
  vec2 texelSize=vec2(1./screenSize.x,1./screenSize.y);
  vec2 bottomLeftUV=vUV-texelSize*halfScaleFloor;
  vec2 topRightUV=vUV+texelSize*halfScaleCeil;
  vec2 bottomRightUV=vUV+vec2(texelSize.x*halfScaleCeil,-texelSize.y*halfScaleFloor);
  vec2 topLeftUV=vUV+vec2(-texelSize.x*halfScaleFloor,texelSize.y*halfScaleCeil);
  vec4 bottomLeftColor=texture2D(textureSampler,bottomLeftUV);
  vec4 topRightColor=texture2D(textureSampler,topRightUV);
  vec4 bottomRightColor=texture2D(textureSampler,bottomRightUV);
  vec4 topLeftColor=texture2D(textureSampler,topLeftUV);
  vec4 blurred=(baseColor+bottomLeftColor+topRightColor+bottomRightColor+topLeftColor)*.2;
  
  gl_FragColor=baseColor;
}
