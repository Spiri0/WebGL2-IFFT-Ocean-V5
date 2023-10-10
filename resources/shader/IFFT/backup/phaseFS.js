export const phaseFS  = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;
	
	#define PI 3.141592653589793238
	#define G 9.81
	#define KM 370.0
	
	in vec2 vUv;
	out vec4 outColor;

	uniform float time;
	uniform sampler2D phases;
	uniform float grdres;
	uniform float grdsiz;

	
	float omega (float k){
		return sqrt(G*k*(1.0+k*k/(KM*KM)));
	}

	void main(){
	
		//vec2 coordinates = vUv - 0.5;
		vec2 coordinates = gl_FragCoord.xy-0.5;
		float n = (coordinates.x < grdres*0.5) ? coordinates.x : coordinates.x - grdres;
		float m = (coordinates.y < grdres*0.5) ? coordinates.y : coordinates.y - grdres;
		
		//vec2 K = (2.0*PI*vec2(n,m))/grdsiz;
		vec2 K = (2.0*PI*vec2(vUv - 0.5))*grdres/grdsiz;
		
		float phase = texture(phases, vUv).r;
		float deltaPhase = omega(length(K))*time;
		phase = mod(phase+deltaPhase, 2.0*PI);
		
		//float phase = mod(deltaPhase, 2.0*PI);
		
		outColor = vec4(phase, 0.0, 0.0, 0.0);
	}
`;