export const h0kSpectrumFS  = `

	precision highp float;
	precision highp int;
	
	#define PI 3.141592653589793238
	#define G 9.81
	#define KM 370.0
	#define CM 0.23

	uniform vec2 wind;
	uniform float size;
	uniform float scale;	
	

	in vec2 vUv;
	out vec4 outColor;


	float square(float x) {
		return x*x;
	}
	float omega(float k) {
		return sqrt(G*k*(1.0+square(k/KM)));
	}
	float tanH(float x) {
		return (1.0-exp(-2.0*x))/(1.0+exp(-2.0*x));
	}


	float random(vec2 par){
		return fract(sin(dot(par.xy,vec2(12.9898,78.233))) * 43758.5453);
	}

	float gaussianRandom(vec2 seed){
		float nrnd0 = random(seed);
		float nrnd1 = random(seed + 0.1);	
		return sqrt(-2.0*log(max(0.001, nrnd0)))*cos(2.0*PI*nrnd1);
	}


	void main(){

		//vec2 coordinates = vUv - 0.5;
		vec2 coordinates = gl_FragCoord.xy-0.5;
		float n = (coordinates.x < size * 0.5) ? coordinates.x : coordinates.x - size;
		float m = (coordinates.y < size * 0.5) ? coordinates.y : coordinates.y - size;
	
		
		vec2 K = (2.0*PI*vec2(n,m))/scale;
		//vec2 K = (2.0*PI*vec2(vUv - 0.5))*size/scale;
		float k = length(K);	
		float l_wind = length(wind);
		float Omega = 0.84;
		float kp = G*square(Omega/l_wind);
		float c = omega(k)/k;
		
		
		float cp = omega(kp)/kp;
		float Lpm = exp(-1.25*square(kp/k));
		float gamma = 1.7;
		float sigma = 0.08*(1.0+4.0*pow(Omega, -3.0));
		float Gamma = exp(-square(sqrt(k/kp)-1.0)/2.0*square(sigma));
		float Jp = pow(gamma, Gamma);
		float Fp = Lpm*Jp*exp(-Omega/sqrt(10.0)*(sqrt(k/kp)-1.0));
		float alphap = 0.006*sqrt(Omega);
		float Bl = 0.5*alphap*cp/c*Fp;
		float z0 = 0.000037 * square(l_wind)/G*pow(l_wind/cp, 0.9);
		float uStar = 0.41*l_wind/log(10.0/z0);		
		float alpham = 0.01*((uStar<CM) ? (1.0+log(uStar/CM)) : (1.0+3.0*log(uStar/CM)));
		float Fm = exp(-0.25*square(k/KM-1.0));
		float Bh = 0.5*alpham*CM/c*Fm*Lpm;
		float a0 = log(2.0)/4.0;
		float am = 0.13*uStar/CM;		
		float Delta = tanH(a0+4.0*pow(c/cp, 2.5)+am*pow(CM/c, 2.5));
		float cosPhi = dot(normalize(wind), normalize(K));
		float S = (1.0/(2.0*PI))*pow(k,-4.0)*(Bl+Bh)*(1.0+Delta*(2.0*cosPhi*cosPhi-1.0));
		float dk = 2.0*PI/scale;
		float h = sqrt(S/2.0)*dk;
		if (K.x == 0.0 && K.y == 0.0) {h = 0.0;} 	//no DC term
		
		
		float er = gaussianRandom(vUv);

		h = h * er;		
		
		outColor = vec4(h, 0.0, 0.0, 0.0);
		//outColor = vec4(h, 0.0, 0.0, 1.0);
		//outColor = vec4(k, 0, 0, 0);
	}
`;