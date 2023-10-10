export const normalFS = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;

	uniform sampler2D displacementMap;
	uniform float grdsiz;
	uniform float grdres;

	in vec2 vUv;
	out vec4 outColor;
	
	
	void main(){
	
		

		float texel = 1.0/grdres;
		float texelSize = grdsiz/grdres;
		vec3 ctr = texture(displacementMap, vUv).rgb;
		
		vec3 rgt = vec3(texelSize, 0.0, 0.0) + texture(displacementMap, vUv + vec2(texel, 0.0)).rgb - ctr;
		vec3 lft = vec3(-texelSize, 0.0, 0.0) + texture(displacementMap, vUv + vec2(-texel, 0.0)).rgb - ctr;
		vec3 top = vec3(0.0, 0.0, -texelSize) + texture(displacementMap, vUv + vec2(0.0, -texel)).rgb - ctr;
		vec3 bot = vec3(0.0, 0.0, texelSize) + texture(displacementMap, vUv + vec2(0.0, texel)).rgb - ctr;	
		
		vec3 topRgt = cross(rgt, top);
		vec3 topLft = cross(top, lft);
		vec3 botLft = cross(lft, bot);
		vec3 botRgt = cross(bot, rgt);
	
		vec3 nrm3 = vec3(normalize(topRgt + topLft + botLft + botRgt));

		outColor = vec4(nrm3, 1.0);
	}
`;