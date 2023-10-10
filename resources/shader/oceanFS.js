export const oceanFS = `


	float random(vec2 par){
		return fract(sin(dot(par.xy,vec2(12.9898,78.233))) * 43758.5453);
	}


	vec2 domain_warp(vec3 posCamera, vec3 position, vec2 uv){
		float eyeDist = distance( position, posCamera );
		
		vec2 domain_warp = uv * random(uv*0.01);
		
		float domain_warp_strength = 0.5;
		float view_distance_max = 20000.0;
		domain_warp *= domain_warp_strength * (eyeDist / view_distance_max);
		
		return uv;// + domain_warp * 0.01;
		//return vec2(1., 1.) * (eyeDist / view_distance_max);
	}




	vec4 getMorphValue(vec3 posCamera, vec3 position){

		float percent = 0.5;
	
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
	
		
		float r = 0.;
		float g = 0.;
		float b = 0.;		
		
		if(n == 0.){
			r = 0.25;
			g = 0.5;
			b = 1.;		
		}
		if(n == 1.){
			g = 1.;		
		}				
		if(n == 2.){
			b = 1.;		
		}				
		if(n == 3.){
			r = 1.;
			g = 1.;		
		}
		if(n == 4.){
			r = 1.;		
		}	
		if(n == 5.){
			g = 1.;		
		}						
		if(n == 6.){
			b = 1.;		
		}				
		if(n == 7.){
			r = 1.;
			g = 1.;		
		}		
		if(n == 8.){
			r = 1.;		
		}	
		if(n == 9.){
			g = 1.;		
		}						
		if(n == 10.){
			b = 1.;		
		}				
		if(n == 11.){
			r = 1.;
			g = 1.;		
		}			
		if(n == 12.){
			r = 1.;		
		}	
		if(n == 13.){
			g = 1.;		
		}						
		if(n == 14.){
			b = 1.;		
		}				
		if(n == 15.){
			r = 1.;
			g = 1.;		
		}			
														
						
		return clamp( (factor - 1.0 + percent) / percent, 0.0, 1.0) * vec4(r, g, b, 1.0);
	}



	vec4 getLodColor(){

		float r = 0.;
		float g = 0.;
		float b = 0.;		

		float n = lod;


		if(n == 0. || n == 3. || n == 6. || n == 9. || n == 12.){
			r = 1.;
		}
		if(n == 1. || n == 4. || n == 7. || n == 10. || n == 13.){
			g = 1.;
		}
		if(n == 2. || n == 5. || n == 8. || n == 11. || n == 14.){
			b = 1.;
		}


	
		return vec4(r, g, b, 1.0);
	}





	// returns intensity of diffuse reflection
	vec3 diffuseLighting(vec3 N, vec3 L){
		// calculation as for Lambertian reflection
		float diffuseTerm = clamp(dot(N, L), 0., 1.) ;
		//return u_matDiffuseReflectance * u_lightDiffuseIntensity * diffuseTerm;
		return  vec3(1.)*diffuseTerm;
	}

	// returns intensity of specular reflection
	
	vec3 specularLighting(vec3 N, vec3 L, vec3 V){
		float specularTerm = 0.;

		// calculate specular reflection only if
		// the surface is oriented to the light source
		if(dot(N, L) > 0.){
			// half vector
		//	vec3 R = reflect(-L, N);
			vec3 H = normalize(L + V);
			specularTerm = pow(dot(N, H), 32.);
	//		float specAngle = max(dot(R, V), 0.0);
	//		float specular = pow(specAngle, 64.);
		}
		//return u_matSpecularReflectance * u_lightSpecularIntensity * specularTerm;
		return vec3(1.)*specularTerm*0.75;
		//return vec3(1.)*specular*10.;
	}





	vec4 _CalculateLighting(vec3 lightDirection, vec3 lightColour, vec3 worldSpaceNormal, vec3 planetNormal, vec3 viewDirection) {
		float diffuse = saturate(dot(worldSpaceNormal, lightDirection));
		
		//float lambertian = max(dot(lightDirection, planetNormal), 0.0);
		vec3 diffuseLight = diffuseLighting(planetNormal, lightDirection);
		//vec3 reflectDir = reflect(-lightDirection, worldSpaceNormal); 
		
		
		vec3 specLight = specularLighting(worldSpaceNormal,  lightDirection,  viewDirection);
		
		
		return vec4(4.*diffuseLight + specLight, 1.0);

	}


	vec4 _ComputeLighting(vec3 worldSpaceNormal, vec3 sunDir, vec3 viewDirection, vec3 planetNormal) {
		vec4 lighting;
  
		lighting += _CalculateLighting(sunDir, 1.0 * vec3(1.0, 1.0, 1.0), worldSpaceNormal, planetNormal, viewDirection);
  
		return lighting;
	}

	//****************

	vec3 orthogonal(vec3 v) {
		return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
	}

	//****************


	vec3 scaledPos(vec3 pos, float scale) {

		float frac = 1./scale;
		
		return vec3(
			frac - abs(mod(scale * pos.x, frac*2.)-frac), 
			frac - abs(mod(scale * pos.y, frac*2.)-frac),
			frac - abs(mod(scale * pos.z, frac*2.)-frac)
		);	
	}



	float sumV3(vec3 v){ 
		return v.x+v.y+v.z; 
	}

	vec4 textureTileBreaker(sampler2D srcTexture, vec2 x) {

		float k = texture(noiseTexture, 0.005*abs(x)).x;
		
		
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



void main() {

	vec3 worldPosition = vPosition;
	vec3 eyeDirection = normalize(worldPosition - cameraPosition);
	//vec3 sunDir = normalize(worldPosition - sunPosition);
	vec3 sunDir = normalize(vec3(0.0, 0.5, -1.));


	//vec2 newUV = domain_warp(cameraPosition, worldPosition, worldPosition.xz);
	vec2 newUV = worldPosition.xz;


	vec3 fftNorm0 = 0.5 * normalize(normalize(textureTileBreaker(normalMap0, newUV * 1./400.).rgb));
	vec3 fftNorm1 = 0.15 * normalize(normalize(textureTileBreaker(normalMap1, newUV * 1./100.).rgb));
	vec3 fftNorm2 = 0.05 * normalize(normalize(textureTileBreaker(normalMap2, newUV * 1./25.).rgb));



	
/*
	vec3 fftNorm0 = 0.5 * texture(normalMap0, newUV * 1./400.).rgb;
	vec3 fftNorm1 = 0.15 * texture(normalMap1, newUV * 1./100.).rgb;
	vec3 fftNorm2 = 0.05 * texture(normalMap2, newUV * 1./25.).rgb;
*/

vec3 noiseTex = texture(noiseTexture, abs(worldPosition.xz)*10./1000000.).rgb;

	//float morphValue = getMorphValue(cameraPosition, vPosD);
	vec4 morphValue = getMorphValue(cameraPosition, vPosition);

	vec4 lodColor = getLodColor();

		vec3 combNorm = normalize(fftNorm0 + fftNorm1 + fftNorm2);
		//vec3 combNorm = normalize(fftNorm0 + fftNorm1);
		//vec3 combNorm = normalize(fftNorm0);
	
		vec3 specLight = specularLighting(combNorm, sunDir, -eyeDirection);


		float ldotn = dot(combNorm, sunDir);
		//float ldotn = dot(vNormal, sunDir);

		//outColor = morphValue *0.5 + lodColor * 0.75;
		//outColor = lodColor * 1.;
		outColor = 2. * vec4(ldotn * 1.5 * vec3(0.0625, 0.118, 0.5), 1.) + vec4(0.1, 0.3, 0.6, 1.0)*0.1 + vec4(specLight * vec3(1.0, 0.8, 0.4), 1.0);
		//outColor = vec4(fftNorm, 1.0);
		
		//outColor = vec4(noiseTex, 1.0);
		
	//	outColor = vec4(0.2, 0.4, 0.9, 1.0);
}
`;



//***************************************************************************************