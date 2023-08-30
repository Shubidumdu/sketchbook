#version 300 es

precision highp float;

out vec4 outColor;
uniform vec2 u_resolution;
uniform float u_time;

float random(in vec2 st){
  return fract(sin(dot(st.xy,
        vec2(12.9898,78.233)))*
      43758.5453123);
    }
    
    float noise(in vec2 st){
      vec2 i=floor(st);
      vec2 f=fract(st);
      
      float a=random(i);
      float b=random(i+vec2(1.,0.));
      float c=random(i+vec2(0.,1.));
      float d=random(i+vec2(1.,1.));
      
      vec2 u=f*f*(3.-2.*f);
      
      return mix(a,b,u.x)+
      (c-a)*u.y*(1.-u.x)+
      (d-b)*u.x*u.y;
    }
    
    #define OCTAVES 8
    float fbm(in vec2 st){
      float value=.9;
      float amplitude=.075;
      float frequency=1.5;
      float lacunarity=2.;
      float gain=.8;
      
      for(int i=0;i<OCTAVES;i++){
        value+=amplitude*noise(frequency*st);
        frequency*=lacunarity;
        amplitude*=gain;
      }
      return value;
    }
    
    float time(){
      return u_time*.00000125;
    }
    
    float f1(in vec2 p)
    {
      vec2 q=vec2(fbm(p+vec2(0.,0.)-4.*time()),
      fbm(p+vec2(5.2,1.3)+8.*time()));
      
      return fbm(p+4.*q);
    }
    
    float f2(in vec2 p)
    {
      vec2 q=vec2(fbm(p+vec2(4.,2.)+3.*time()),
      fbm(p+vec2(1.2,4.7)-6.*time()));
      
      vec2 r=vec2(fbm(p+2.*q+vec2(1.7,9.2)),
      fbm(p+2.*q+vec2(8.3,2.8)));
      
      return fbm(p+2.*r);
    }
    
    void main(){
      vec2 st=gl_FragCoord.xy/u_resolution.xy;
      st.x*=u_resolution.x/u_resolution.y;
      vec3 color=vec3(.0);
      vec3 p1=f1(st*.1)*vec3(1.,.9176,.8+.2*st.y);
      vec3 p2=f2(st*.25)*vec3(.6853+.2*(1.-st.y),.9137,1.);
      color=mix(p1,p2,.5);
      outColor=vec4(color,1.);
    }
    