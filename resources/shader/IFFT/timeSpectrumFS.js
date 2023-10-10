export const timeSpectrumFS  = `

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
	
		vec2 coordinates = gl_FragCoord.xy-0.5;
		float n = (coordinates.x < grdres * 0.5) ? coordinates.x : coordinates.x - grdres;
		float m = (coordinates.y < grdres * 0.5) ? coordinates.y : coordinates.y - grdres;
	
		
		vec2 K = (2.0*PI*vec2(n,m))/grdsiz;

		float w = omega(length(K));	
		vec2 exp_iwt = vec2(cos(w*time), sin(w*time));

		vec4 h0 = texture(begFFT, vUv);

		vec2 h = multiplyComplex(h0.rg, exp_iwt) + multiplyComplex(h0.ba, vec2(exp_iwt.x, -exp_iwt.y));
	
		vec2 hX = -multiplyByI(h * (K.x / length(K))) * choppy;
		vec2 hZ = -multiplyByI(h * (K.y / length(K))) * choppy;
		
		if(K.x == 0.0 && K.y == 0.0) {
		h = vec2(0.0);
		hX = vec2(0.0);
		hZ = vec2(0.0);
		}
		outColor = vec4(hX + multiplyByI(h), hZ);
	}
`;