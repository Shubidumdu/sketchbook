#version 300 es

precision highp float;

out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;

float random (in vec2 st) {
  return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 8
float fbm (in vec2 st) {
    float value = 0.0;
    float amplitude = .5;
    float frequency = 2.;
    float lacunarity = 2.;
    float gain = .8;

    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(frequency * st);
        frequency *= lacunarity;
        amplitude *= gain;
    }
    return value;
}

float time() {
  return u_time * .00000125;
}

float pattern( in vec2 p )
{
    vec2 q = vec2( fbm( p + vec2(0.0,0.0) - 4. * time() ),
                   fbm( p + vec2(5.2,1.3) + 8. * time()) );

    return fbm( p + 4.0*q );
}

float pattern2( in vec2 p )
{
    vec2 q = vec2( fbm( p + vec2(4.0,2.0) + 3. * time() ),
                   fbm( p + vec2(1.2,4.7) - 6. * time() ) );

    vec2 r = vec2( fbm( p + 2.0*q + vec2(1.7,9.2) ),
                   fbm( p + 2.0*q + vec2(8.3,2.8) ) );

    return fbm( p + 2.0*r );
}

float pattern3( in vec2 p )
{
    vec2 q = vec2( fbm( p + vec2(0.0,0.0) + 10. * time()),
                   fbm( p + vec2(5.2,1.3)) - 5. * time() );

    vec2 r = vec2( fbm( p + 1.0*q + vec2(1.7,9.2) ),
                   fbm( p + 1.0*q + vec2(2.3,2.8) ) );

    vec2 s = vec2( fbm( p + 2.0*r + vec2(5.7,3.2) ),
                   fbm( p + 2.0*r + vec2(2.3,5.8) ) );

    return fbm( .1 * p + 2.0*r + 4.0 * s );
}

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;

  vec3 color = vec3(.0);
  vec3 p1 = pattern(st*.1) * vec3(0.2941, 0.1333, 0.1882);
  vec3 p2 = pattern2(st*.25) * vec3(0.0039, 0.0039, 0.3137);
  vec3 p3 = pattern3(st * .25) * vec3(.25);

  color = mix(p1, p2, .5);
  color = mix(color, p3, .8);
  // color = p3;

  outColor = vec4(color,1.0);
}
