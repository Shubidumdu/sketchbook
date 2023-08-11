#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D depthSampler;

uniform vec2 screenSize;

const float scale = 1.;
const float halfScaleFloor = floor(scale * 0.5);
const float halfScaleCeil = ceil(scale * 0.5);
const float depthThreshold = 1.5;
const float normalThreshold = .4;

void main(void) 
{
    vec2 texelSize = vec2(1.0 / screenSize.x, 1.0 / screenSize.y);
    vec4 baseColor = texture2D(textureSampler, vUV);
    vec2 bottomLeftUV = vUV - texelSize * halfScaleFloor;
    vec2 topRightUV = vUV + texelSize * halfScaleCeil;
    vec2 bottomRightUV = vUV + vec2(texelSize.x * halfScaleCeil, -texelSize.y * halfScaleFloor);
    vec2 topLeftUV = vUV + vec2(-texelSize.x * halfScaleFloor, texelSize.y * halfScaleCeil);
    float depth0 = texture2D(depthSampler, bottomLeftUV).r;
    float depth1 = texture2D(depthSampler, topRightUV).r;
    float depth2 = texture2D(depthSampler, bottomRightUV).r;
    float depth3 = texture2D(depthSampler, topLeftUV).r;
    float diffDepth0 = depth1 - depth0;
    float diffDepth1 = depth3 - depth2;
    float edgeDepth = sqrt(pow(diffDepth0, 2.) + pow(diffDepth1, 2.)) * 100.;

    if (edgeDepth > depthThreshold) {
      gl_FragColor = vec4(vec3(0.), 1.);
    } else {
      gl_FragColor = baseColor;
    }
}