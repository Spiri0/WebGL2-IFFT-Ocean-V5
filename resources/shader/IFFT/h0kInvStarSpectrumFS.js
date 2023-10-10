export const h0kInvStarSpectrumFS  = `

	precision highp float;
	precision highp int;

	uniform float size;
	uniform sampler2D h0k;
	
	in vec2 vUv;
	out vec4 outColor;


	void main(){
	
		vec2 h0kSpectrum = texture(h0k, gl_FragCoord.xy/size).rg;
		vec2 h0kminusSpectrum = texture(h0k, vec2(mod(size - gl_FragCoord.x, size)/size, mod(size - gl_FragCoord.y, size)/size)).rg;

		outColor = vec4(h0kSpectrum, h0kminusSpectrum.x, -h0kminusSpectrum.y);
	}
`;