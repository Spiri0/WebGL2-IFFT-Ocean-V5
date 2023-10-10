export const currentSpectrumFS  = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;
	
	#define PI 3.141592653589793238
	#define G 9.81
	#define KM 370.0
	
	in vec2 vUv;
	out vec4 outColor;


	uniform float grdsiz;
	uniform float grdres;
	uniform float choppy;
	uniform float time;
	//uniform sampler2D phases;
	uniform sampler2D begFFT;


	vec2 multiplyComplex(vec2 a, vec2 b){
		return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
	}

	vec2 multiplyByI(vec2 z){
		return vec2(-z.y, z.x);
	}

	float omega(float k){
		return sqrt(G*k*(1.0+k*k/KM*KM));
	}

	void main(){
	
		//vec2 coordinates = vUv - 0.5;
		vec2 coordinates = gl_FragCoord.xy-0.5;
		float n = (coordinates.x < grdres * 0.5) ? coordinates.x : coordinates.x - grdres;
		float m = (coordinates.y < grdres * 0.5) ? coordinates.y : coordinates.y - grdres;
		
		//vec2 waveVector = (2.0 * PI * vec2(n, m)) / grdsiz;
		//vec2 waveVector = (2.0*PI*vec2(vUv - 0.5))*grdres/grdsiz;
	
		vec2 K = (2.0*PI*vec2(vUv - 0.5))*grdres/grdsiz;


	
	/*	
		float phase = texture(phases, vUv).r;	
		vec2 phaseVector = vec2(cos(phase), sin(phase));
		vec2 h0 = texture(begFFT, vUv).rg;
		vec2 h0Star = texture(begFFT, vec2(1.0 - vUv + 1.0 / grdres)).rg;
		h0Star.y *= -1.0;		//star means conj complex	
		vec2 h = multiplyComplex(h0, phaseVector) + multiplyComplex(h0Star, vec2(phaseVector.x, -phaseVector.y));
		vec2 hX = -multiplyByI(h * (waveVector.x / length(waveVector))) * choppy;
		vec2 hZ = -multiplyByI(h * (waveVector.y / length(waveVector))) * choppy;
		//no DC term
*/		
		
		
/*		
		if (waveVector.x == 0.0 && waveVector.y == 0.0) {
		h = vec2(0.0);
		hX = vec2(0.0);
		hZ = vec2(0.0);
		}
		outColor = vec4(hX + multiplyByI(h), hZ);
*/
	
		outColor = vec4(1.0, 0.5, 0.0, 1.0);
		
	}
`;