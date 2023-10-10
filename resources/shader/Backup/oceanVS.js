export const oceanVS = `

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
	uniform vec4 neighbours;

	uniform sampler2D vertexTexture;
	uniform sampler2D normalTexture;


	// Attributes
	in vec3 position;
	in vec3 normal;
	in vec3 coords;
	in int vindex;


	// Outputs
	out vec3 vNormal;
	out vec3 wNormal;
	out vec3 vCoords;
	out float idx;








	//-----------------




vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}


// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}



	//-----------------

	vec3 orthogonal(vec3 v) {
		return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
	}
	

	vec3 lerpPos(int i, int i1, int i2, float p, float width, float height){
	
		int colIdx1 = int(floor(float(i1) / width));
   	int rowIdx1 = int(mod(float(i1), height));
		vec3 norm1 = texelFetch(normalTexture, ivec2(rowIdx1, colIdx1), 0).rgb;	
		vec3 positionD1 = texelFetch(vertexTexture, ivec2(rowIdx1, colIdx1), 0).rgb;

   	int colIdx2 = int(floor(float(i2) / width));
   	int rowIdx2 = int(mod(float(i2), height));
		vec3 norm2 = texelFetch(normalTexture, ivec2(rowIdx2, colIdx2), 0).rgb;						
		vec3 positionD2 = texelFetch(vertexTexture, ivec2(rowIdx2, colIdx2), 0).rgb;

		vec3 wpos1 = (modelMatrix * vec4(positionD1, 1.0)).xyz + cameraPosition;
		vec3 wpos2 = (modelMatrix * vec4(positionD2, 1.0)).xyz + cameraPosition;

		float displacement1 = 3.0 * pnoise( 0.1 * wpos1 + vec3( 0.5 * time ), vec3( 3.0 ) );
		float displacement2 = 3.0 * pnoise( 0.1 * wpos2 + vec3( 0.5 * time ), vec3( 3.0 ) );
										
		float lerpfrac = mix(displacement1, displacement2, p);

   	int colIdx = int(floor(float(i) / width));
   	int rowIdx = int(mod(float(i), height));
		vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
		vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;

		vec3 result = pos + norm * lerpfrac;

		return result;
	}


	vec3 FixEdgesToMatchNeighbours(int index, float width, float height){
		int realResolution = resolution + 2;
		int effectiveResolution = resolution;


		if(int(neighbours.x) > 1){
			int x = 1;
			int stride = int(neighbours.x);
			
			for (int z = 1; z <= realResolution-1-stride; z+=stride) {			
				int i1 = x * (realResolution + 1) + z;
				int i2 = x * (realResolution + 1) + (z + stride);			
				for (int s = 1; s < stride; ++s){
					int i = x * (realResolution + 1) + z + s;
					float p = float(s)/float(stride);
					if(index == i){
					
						return lerpPos(i, i1, i2, p, width, height);
						
						/*
						int colIdx = int(floor(float(i) / width));
   					int rowIdx = int(mod(float(i), height));
						vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
						vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;
						return pos;				
						*/
					}
				}
			}			
		}//end if


		if(int(neighbours.y) > 1){
			int z = realResolution - 1;
			int stride = int(neighbours.y);				

			for (int x = 1; x <= realResolution-1-stride; x+=stride) {
				int i1 = x * (realResolution + 1) + z;
				int i2 = (x + stride) * (realResolution + 1) + z;
				for (int s = 1; s < stride; ++s){
					int i = (x + s) * (realResolution + 1) + z;
					float p = float(s)/float(stride);
					if(index == i){	
	
						return lerpPos(i, i1, i2, p, width, height);	
						
						/*
						int colIdx = int(floor(float(i) / width));
   					int rowIdx = int(mod(float(i), height));
						vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
						vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;
						return pos;
						*/
					}
				}
			}
		}//end if


		if(int(neighbours.z) > 1){
			int x = realResolution - 1;
			int stride = int(neighbours.z);				

			for (int z = 1; z <= realResolution-1-stride; z+=stride) {
				int i1 = x * (realResolution + 1) + z;
				int i2 = x * (realResolution + 1) + (z + stride);
				for (int s = 1; s < stride; ++s){
					int i = x * (realResolution + 1) + z + s;
					float p = float(s)/float(stride);
					if(index == i){	
		
						return lerpPos(i, i1, i2, p, width, height);
	
						/*					
						int colIdx = int(floor(float(i) / width));
   					int rowIdx = int(mod(float(i), height));
						vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
						vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;	
						return pos;
						*/
					}
				}
			}
		}//end if


		if(int(neighbours.w) > 1){
			int z = 1;
			int stride = int(neighbours.w);				

			for (int x = 1; x <= realResolution-1-stride; x+=stride) {
				int i1 = x * (realResolution + 1) + z;
				int i2 = (x + stride) * (realResolution + 1) + z;
				for (int s = 1; s < stride; ++s){
					int i = (x + s) * (realResolution + 1) + z;
					float p = float(s)/float(stride);
					if(index == i){	

						return lerpPos(i, i1, i2, p, width, height);
						
						/*
			   		int colIdx = int(floor(float(i) / width));
   					int rowIdx = int(mod(float(i), height));
						vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
						vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
						return pos;
						*/
					}
				}
			}
		}//end if




		//SkirtCorners

		if(index == 0){
			int colIdx = int(floor(float(realResolution + 2) / width));
   		int rowIdx = int(mod(float(realResolution + 2), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}
		
		if(index == realResolution){
			int colIdx = int(floor(float(realResolution * 2) / width));
   		int rowIdx = int(mod(float(realResolution * 2), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}

		if(index == (realResolution + 1) * realResolution){
			int colIdx = int(floor(float((realResolution + 1) * realResolution - realResolution) / width));
   		int rowIdx = int(mod(float((realResolution + 1) * realResolution - realResolution), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}

		if(index == (realResolution + 1) * (realResolution + 1) - 1){
			int colIdx = int(floor(float((realResolution + 1) * (realResolution + 1) - realResolution - 3) / width));
   		int rowIdx = int(mod(float((realResolution + 1) * (realResolution + 1) - realResolution - 3), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}

		
		//SkirtEdges

		if(index >= 1 && index <= realResolution - 1){
			int colIdx = int(floor(float(realResolution + 1 + index) / width));
   		int rowIdx = int(mod(float(realResolution + 1 + index), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}

		if(index >= (realResolution+1) * realResolution+1 && index <= (realResolution+1) * (realResolution+1) - 2){
			int colIdx = int(floor(float(index - realResolution - 1) / width));
   		int rowIdx = int(mod(float(index - realResolution - 1), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}

		if(mod(float(index), float(realResolution + 1)) == 0.){
			int colIdx = int(floor(float(index + 1) / width));
   		int rowIdx = int(mod(float(index + 1), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}

		if(mod(float(index + 1), float(realResolution + 1)) == 0.){
			int colIdx = int(floor(float(index - 1) / width));
   		int rowIdx = int(mod(float(index - 1), height));
			vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
			vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;		
			return pos - norm * 6.;		
		}




	
		return vec3(0.);
	}



	//-----------------


	void main(){

		idx = float(vindex);

		ivec2 texSize = textureSize(vertexTexture, 0);
   	float texWidth = float(texSize.x);
   	float texHeight = float(texSize.y);
   	int colIdx = int(floor(idx / texWidth));
   	int rowIdx = int(mod(idx, texHeight));
		vec3 positionD = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;
		vec3 normalD = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;
	
		vec3 wpos = (modelMatrix * vec4(positionD, 1.0)).xyz + cameraPosition;
		float displacement = 3.0 * pnoise( 0.1 * wpos + vec3( 0.5 * time ), vec3( 3.0 ) );
		vec3 displacedPosition = positionD + normalD * displacement;
  
  
		vec3 posoff = FixEdgesToMatchNeighbours(vindex, texWidth, texHeight);
  
		if(dot(posoff, posoff) > 0.){
			displacedPosition = posoff;
		}
		
		vCoords = coords;
		vNormal = normalize(normalD);
		gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);	
	}
`;