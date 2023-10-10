export const IFFTVerticalFS = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;
	
	out vec4 outColor;

	uniform sampler2D u_input;
	uniform sampler2D butterfly;
	uniform float step;
	uniform float bfw;
	uniform float size;

	vec2 multiplyComplex(vec2 a, vec2 b){
		return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
	}
	
	void main(){

		vec4 data = texture(butterfly, vec2(step/bfw, gl_FragCoord.y/size));

		vec4 even = texture(u_input, vec2(gl_FragCoord.x/size, data.z));
		vec4 odd = texture(u_input, vec2(gl_FragCoord.x/size, data.w));

		vec2 outputA = even.xy + multiplyComplex(data.rg, odd.xy);
		vec2 outputB = even.zw + multiplyComplex(data.rg, odd.zw);
		outColor = vec4(outputA,outputB);
	}
`;