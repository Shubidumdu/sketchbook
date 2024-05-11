#version 300 es
precision highp float;

uniform vec3 lightPositions[3];
uniform mat4 world;
uniform vec3 cameraPosition;

in vec3 vPosition;
in vec3 vNormal;
in vec3 vColor;

out vec4 fragColor;

vec3 lightColor = vec3(23.47, 21.31, 20.79);

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

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}  

void main(void){
  float metallic = .5;
  float roughness = .5;
  vec3 albedo = vColor;
  vec3 N=vNormal;
  vec3 V=normalize(cameraPosition - vPosition);
  vec3 F0=vec3(0.04);
  F0=mix(F0, albedo, metallic);

  // reflectance equation
  vec3 Lo = vec3(0.0);

  for (int i = 0; i < 3; i++) {
    vec3 lightPosition = lightPositions[i];
    vec3 L = normalize(lightPosition - vPosition);
    vec3 H = normalize(V + L);
    float distance = length(lightPosition - vPosition);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColor * attenuation;
    
    // cook-torrance brdf
    float NDF = DistributionGGX(N, H, roughness);
    float G = GeometrySmith(N, V, L, roughness);      
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);       
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;
    
    vec3 numerator    = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    vec3 specular     = numerator / denominator;

    float NdotL = max(dot(N, L), 0.0);                
    Lo += (kD * albedo / PI + specular) * radiance * NdotL;    
  }

  vec3 ambient = vec3(0.04) * albedo;
  vec3 color = ambient + Lo;

  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0/2.2));

  fragColor=vec4(color,1.);
}
