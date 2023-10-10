//resolution don't mean the vertices.
//resolution means the number of squares per edge


export const FixEdges = `


	vec3 lerpPos(int i, int i1, int i2, float p, float width, float height){
	
		int colIdx1 = int(floor(float(i1) / width));
   	int rowIdx1 = int(mod(float(i1), height));
		vec3 norm1 = texelFetch(normalTexture, ivec2(rowIdx1, colIdx1), 0).rgb;	
		vec3 positionD1 = texelFetch(vertexTexture, ivec2(rowIdx1, colIdx1), 0).rgb;

   	int colIdx2 = int(floor(float(i2) / width));
   	int rowIdx2 = int(mod(float(i2), height));
		vec3 norm2 = texelFetch(normalTexture, ivec2(rowIdx2, colIdx2), 0).rgb;						
		vec3 positionD2 = texelFetch(vertexTexture, ivec2(rowIdx2, colIdx2), 0).rgb;


		vec3 disp1 = textureTileBreaker(displacementMap, positionD1.xz * 1./512.).rgb;
		vec3 disp2 = textureTileBreaker(displacementMap, positionD2.xz * 1./512.).rgb;
														
		vec3 lerpfrac = mix(disp1, disp2, p);


   	int colIdx = int(floor(float(i) / width));
   	int rowIdx = int(mod(float(i), height));
		vec3 norm = texelFetch(normalTexture, ivec2(rowIdx, colIdx), 0).rgb;					
		vec3 pos = texelFetch(vertexTexture, ivec2(rowIdx, colIdx), 0).rgb;
		
		vec3 result = pos + lerpfrac;

		return result;
	}


	vec3 FixEdges(int index, float width, float height){

		if(int(neighbours.x) > 1 && vindex >= 1 && vindex <= resolution){
			int stride = int(neighbours.x);
			
			for (int z = 0; z <= resolution-stride; z+=stride) {			
				int i1 = z;
				int i2 = z + stride;			
				for (int s = 1; s < stride; ++s){
					int i = z + s;
					float p = float(s)/float(stride);
					if(index == i){				
						return lerpPos(i, i1, i2, p, width, height);					
					}
				}
			}			
		}//end if

		if(int(neighbours.y) > 1 && mod(float(index + 1), float(resolution + 1)) == 0.){
			int z = resolution;
			int stride = int(neighbours.y);				

			for (int x = 0; x <= resolution-stride; x+=stride) {
				int i1 = x * (resolution + 1) + z;
				int i2 = (x + stride) * (resolution + 1) + z;
				for (int s = 1; s < stride; ++s){
					int i = (x + s) * (resolution + 1) + z;
					float p = float(s)/float(stride);
					if(index == i){	
						return lerpPos(i, i1, i2, p, width, height);						
					}
				}
			}
		}//end if

		if(int(neighbours.z) > 1 && vindex >= resolution*(resolution+1) && vindex <= resolution*(resolution+1) + resolution){
			int x = resolution;
			int stride = int(neighbours.z);				

			for (int z = 0; z <= resolution-stride; z+=stride) {
				int i1 = x * (resolution + 1) + z;
				int i2 = x * (resolution + 1) + (z + stride);
				for (int s = 1; s < stride; ++s){
					int i = x * (resolution + 1) + z + s;
					float p = float(s)/float(stride);
					if(index == i){		
						return lerpPos(i, i1, i2, p, width, height);
					}
				}
			}
		}//end if

		if(int(neighbours.w) > 1 && mod(float(vindex), float(resolution+1)) == 0.){
			int stride = int(neighbours.w);				

			for (int x = 0; x <= resolution-stride; x+=stride) {
				int i1 = x * (resolution + 1);
				int i2 = (x + stride) * (resolution + 1);
				for (int s = 1; s < stride; ++s){
					int i = (x + s) * (resolution + 1);
					float p = float(s)/float(stride);
					if(index == i){	
						return lerpPos(i, i1, i2, p, width, height);					
					}
				}
			}
		}//end if

		return vec3(0.);
	}
`;