export const oceanVS = `


	float sumV3(vec3 v){ 
		return v.x+v.y+v.z; 
	}

	vec4 textureTileBreaker(sampler2D srcTexture, vec2 x) {

		float k = texture(noiseTexture, 0.005 * abs(x)).x;
/*
    vec2 dx = vec2(1.0 / 512.0, 0.0);
    vec2 dy = vec2(0.0, 1.0 / 512.0);
    
    float left = texture(displacementTexture, uv - dx).r;
    float right = texture(displacementTexture, uv + dx).r;
    float up = texture(displacementTexture, uv + dy).r;
    float down = texture(displacementTexture, uv - dy).r;

    float dFdxValue = (right - left);
    float dFdyValue = (up - down);
*/


		
		float l = k*8.0;
		float f = fract(l);
  
		float ia = floor(l+0.5); // suslik's method (see comments)
		float ib = floor(l);
		f = min(f, 1.0-f)*2.0;

		vec2 offa = sin(vec2(3.0,7.0)*ia); // can replace with any other hash
		vec2 offb = sin(vec2(3.0,7.0)*ib); // can replace with any other hash

		vec4 cola = texture(srcTexture, vec2(x.xy + offa));
		vec4 colb = texture(srcTexture, vec2(x.xy + offb));

		return mix(cola, colb, smoothstep(0.2,0.8,f-0.1*sumV3(cola.xyz-colb.xyz)));
 
	}




float random(vec2 par){
   return fract(sin(dot(par.xy,vec2(12.9898,78.233))) * 43758.5453);
}


/*
// Apply domain warp to the given coordinate. This has no effect at 0 distance,
// and gets stronger linearly as distance increases. It will reach 100% strength
// at view_distance_max.
vec2 domain_warp(vec2 uv, float linear_dist) {
	vec2 domain_warp = vec2(
			texture(domain_warp_texture, uv * domain_warp_uv_scale).r,
			texture(domain_warp_texture, -uv * domain_warp_uv_scale).r);
	
	domain_warp *= domain_warp_strength * (linear_dist / view_distance_max);
	
	return uv + domain_warp;
}
*/


	vec2 domain_warp(vec3 posCamera, vec3 position, vec2 uv){
		float eyeDist = distance( position, posCamera );
		
		vec2 domain_warp = uv * random(uv * 0.001);
		
		float domain_warp_strength = 0.001;
		float view_distance_max = 50000.0;
		domain_warp *= domain_warp_strength * (eyeDist / view_distance_max);
		
		return uv;// + domain_warp * 0.1;
	}



	float getMorphValue(vec3 posCamera, vec3 position){
	
		float height = posCamera.y - position.y;	
		float eyeDist = distance( position, posCamera );
		float phi = acos(height/eyeDist);
		float dist = sin(phi) * eyeDist;
		
		float n = log2(eyeDist/minRadius);

		float min = 0.;
		float max = 0.;	
	
		if(n <= 0.){
			n = 0.;
			
			min = 0.;			
			max = sin(acos(height/minRadius)) * minRadius;	
		}	
		else{
			n = floor(n);

			if(height <= minRadius * pow(2.0, n)){
				min = sin(acos(height/(minRadius *  pow(2.0, n))  )) * minRadius * pow(2.0, n);
			}
			max = sin(acos(height/(minRadius *  pow(2.0, n + 1.0))  )) * minRadius * pow(2.0, n + 1.0);
			
			n = n + 1.;
		}	
	
		float delta = max - min;
		float factor = (dist - min) / delta;


		float startpercent = 0.5;
		float endpercent = 0.9;

		if(lod == n){
			//return clamp( (factor - 1.0 + percent) / percent, 0.0, 1.0);
			return clamp((dist - min - delta * startpercent)/((endpercent - startpercent) * delta), 0.0, 1.0);
		}
		return 1.;
	}





	vec2 morphVertex(vec3 vertex, float morphValue){

		float idx = float(vindex);
   		float colIdx = floor(idx / (gridResolution+1.));
   		float rowIdx = mod(idx, (gridResolution+1.));	
		
		vec2 fractPart = fract(vec2(colIdx, rowIdx) * 0.5) * 2./vec2(gridResolution) * width;	
		

		if(mod(idx, gridResolution + 1.0) != 0.){
			return vertex.xz - fractPart * morphValue;
		}

		for(float i = 0.0; i < gridResolution/2.0; i++){
			if(idx == gridResolution + 1.0 + 2.0 * (gridResolution + 1.0) * i){
				return vertex.xz - vec2(1., 0.) * width/gridResolution * morphValue;
			}
		}

		return vertex.xz;
	}




	vec3 orthogonal(vec3 v) {
		return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
	}

	//-----------------


	void main(){


		float morphValue = getMorphValue(cameraPosition, position);
		vec2 morphedVertex = morphVertex(position, morphValue);

		vec3 vertex = vec3(morphedVertex.x, 0., morphedVertex.y);
		

		//vec2 newUV = domain_warp(cameraPosition, position, vertex.xz);
		vec2 newUV = vertex.xz;

		vec3 displacement0 = 0.5 * textureTileBreaker(displacementMap0, newUV * 1./400.).rgb;
		vec3 displacement1 = 0.15 * textureTileBreaker(displacementMap1, newUV * 1./100.).rgb;
		vec3 displacement2 = 0.05 * textureTileBreaker(displacementMap2, newUV * 1./25.).rgb;
		
	
	
		
		
/*		
		vec3 displacement0 = 0.5 * texture(displacementMap0, newUV * 1./400.).rgb;
		vec3 displacement1 = 0.15 * texture(displacementMap1, newUV * 1./100.).rgb;
		vec3 displacement2 = 0.05 * texture(displacementMap2, newUV * 1./25.).rgb;
*/
		
 		vec3 displacedPosition = vertex + displacement0 + displacement1 + displacement2;
  

		vPosition = displacedPosition;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
		//vPosition = vertex;
		//gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex, 1.0);
				
	}
`;