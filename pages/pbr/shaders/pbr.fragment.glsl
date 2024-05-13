#version 300 es
precision highp float;

uniform vec3 lightPositions[4];
uniform vec3 lightColors[4];
uniform mat4 world;
uniform vec3 cameraPosition;
uniform float metallic;
uniform float roughness;
uniform vec3 sphericalHarmonics[9];

uniform samplerCube environmentMap;
uniform sampler2D   brdfLUT;  

in vec3 vPosition;
in vec3 vNormal;
in vec3 vColor;

out vec4 fragColor;

vec3 lightColor = vec3(25.47, 21.31, 20.79) * 4.;

const float PI = 3.14159265359;

float DistributionGGX(vec3 N, vec3 H, float roughness) {
  float a      = roughness*roughness;
  float a2     = a*a;
  float NdotH  = max(dot(N, H), 0.0);
  float NdotH2 = NdotH*NdotH;

  float num   = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;

  return num / denom;
  return 1.;
}

float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float num   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return num / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);
	
    return ggx1 * ggx2;
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
  return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

vec3 irradianceSH(vec3 n) {
  return
      sphericalHarmonics[0]
    + sphericalHarmonics[1] * (n.y)
    + sphericalHarmonics[2] * (n.z)
    + sphericalHarmonics[3] * (n.x)
    + sphericalHarmonics[4] * (n.y * n.x)
    + sphericalHarmonics[5] * (n.y * n.z)
    + sphericalHarmonics[6] * (3.0 * n.z * n.z - 1.0)
    + sphericalHarmonics[7] * (n.z * n.x)
    + sphericalHarmonics[8] * (n.x * n.x - n.y * n.y);
}

void main(void){
  vec3 albedo = pow(vColor, vec3(2.2));
  vec3 N=vNormal;
  vec3 V=normalize(cameraPosition - vPosition);
  vec3 R = reflect(-V, N);

  vec3 F0=vec3(0.04);
  F0=mix(F0, albedo, metallic);
  
  vec3 Lo = vec3(0.0);
 
  for (int i=0; i < 4; ++i) {
    vec3 lightPosition = lightPositions[i];
    vec3 L = normalize(lightPositions[i] - vPosition);
    vec3 H = normalize(V + L);
    float distance = length(lightPosition - vPosition);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColors[i] * attenuation;

    float NDF = DistributionGGX(N, H, roughness);   
    float G   = GeometrySmith(N, V, L, roughness);    
    vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);

    vec3 numerator    = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001; // + 0.0001 to prevent divide by zero
    vec3 specular = numerator / denominator;

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;	       

    // scale light by NdotL
    float NdotL = max(dot(N, L), 0.0);        

    // add to outgoing radiance Lo
    Lo += (kD * albedo / PI + specular) * radiance * NdotL; // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again
  }

  // ambient lighting (we now use IBL as the ambient term)
  vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);
  
  vec3 kS = F;
  vec3 kD = 1.0 - kS;
  kD *= 1.0 - metallic;	  
  
  vec3 irradiance = irradianceSH(N);
  vec3 diffuse = irradiance * albedo;

  const float MAX_REFLECTION_LOD = 4.0;
  vec3 prefilteredColor = textureLod(environmentMap, R,  roughness * MAX_REFLECTION_LOD).rgb;    
  vec2 brdf  = texture(brdfLUT, vec2(max(dot(N, V), 0.0), roughness)).rg;
  vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);

  vec3 ambient = (kD * diffuse + specular);

  vec3 color = ambient + Lo;

    // HDR tonemapping
  color = color / (color + vec3(1.0));
  // gamma correct
  color = pow(color, vec3(1.0/2.2)); 

  fragColor = vec4(color , 1.0);
}
