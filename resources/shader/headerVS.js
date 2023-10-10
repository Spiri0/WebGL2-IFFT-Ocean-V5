export const headerVS = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;

	uniform mat4 modelMatrix;
	uniform mat4 modelViewMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 projectionMatrix;
	uniform vec3 cameraPosition;

	uniform float time;

	uniform mat4 wMatrix;
	uniform int resolution;
	uniform vec3 offset;
	uniform vec3 origin;
	uniform float width;	

	uniform float minRadius;
	uniform float numLayers;
	uniform float gridResolution;

	uniform sampler2D noiseTexture;

	uniform float lod;

	uniform sampler2D displacementMap0;
	uniform sampler2D displacementMap1;
	uniform sampler2D displacementMap2;
	uniform sampler2D normalMap0;
	uniform sampler2D normalMap1;
	uniform sampler2D normalMap2;
	uniform float grdsiz;
	uniform float grdres;

	// Attributes
	in vec3 position;
	in int vindex;

	// Outputs
	out vec3 vNormal;
	out vec3 vPosition;
	out float idx;
	
	#define saturate(a) clamp( a, 0.0, 1.0 )
	
	
	
	

	
	

	//float sum( vec3 v ) { return v.x+v.y+v.z; }

/*
	vec3 textureNoTile(vec2 x, float v){
	
		float k = texture( iChannel1, 0.005*x ).x; // cheap (cache friendly) lookup
    
		vec2 duvdx = dFdx( x );
		vec2 duvdy = dFdy( x );
    
		float l = k*8.0;
		float f = fract(l);
		
		#if 1
		float ia = floor(l);
		float ib = ia + 1.0;
		#else
		float ia = floor(l+0.5);
		float ib = floor(l);
		f = min(f, 1.0-f)*2.0;
		#endif    
    
		vec2 offa = sin(vec2(3.0,7.0)*ia); // can replace with any other hash
		vec2 offb = sin(vec2(3.0,7.0)*ib); // can replace with any other hash

		vec3 cola = textureGrad( iChannel0, x + v*offa, duvdx, duvdy ).xyz;
		vec3 colb = textureGrad( iChannel0, x + v*offb, duvdx, duvdy ).xyz;
    
		return mix( cola, colb, smoothstep(0.2,0.8,f-0.1*sum(cola-colb)) );
	}
*/

/*
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xx;
	
	float f = smoothstep( 0.4, 0.6, sin(iTime    ) );
    float s = smoothstep( 0.4, 0.6, sin(iTime*0.5) );
        
	vec3 col = textureNoTile( (4.0 + 6.0*s)*uv, f );
	
	fragColor = vec4( col, 1.0 );
}
*/	
	
`;	