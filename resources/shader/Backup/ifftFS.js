export const ifftFS = `

	#define PI 3.141592653589793238
	#define FLT_MAX 3.402823466e+38

	precision highp float;
	precision highp int;
	precision highp sampler2DArray;
	precision highp sampler3D;
	precision highp sampler2D;
/*
	uniform sampler2D noiseTexture00;
	uniform sampler2D noiseTexture01;
	uniform sampler2D noiseTexture02;
	uniform sampler2D noiseTexture03;
*/
	const int N = 1;
	const float A = 4.0;	//Numerical constant controlling wave height
	const float L = 5.0;
	const float V = 40.0;
	const vec2 windDirection = vec2(1.0, 1.0);
	const float g = 9.81;

	//uniform float time;

	in vec2 vUv;

	out vec4 outColor;

/*
	//Box-Muller-Method
	vec4 gaussRND(){
	
		float noise00 = clamp(texture(noiseTexture01, vUv).r, 0.0001, 1.0);
		float noise01 = clamp(texture(noiseTexture03, vUv).r, 0.0001, 1.0);
		float noise02 = clamp(texture(noiseTexture02, vUv).r, 0.0001, 1.0);
		float noise03 = clamp(texture(noiseTexture00, vUv).r, 0.0001, 1.0);
		
		float u0 = 2.0 * PI * noise00;		
		float v0 = 2.0 * sqrt(-2.0 * log(noise01));		
		float u1 = 2.0 * PI * noise02;		
		float v1 = 2.0 * sqrt(-2.0 * log(noise03));

		vec4 rnd = vec4(v0 * cos(u0), v0 * sin(u0), v1 * cos(u1), v1 * sin(u1));

		
		return rnd;
	}
*/


float random(vec2 par){
   return fract(sin(dot(par.xy,vec2(12.9898,78.233))) * 43758.5453);
}

float gaussianRandom(vec2 seed){
	float nrnd0 = random(seed);
	float nrnd1 = random(seed + 0.1);	
	return sqrt(-2.0*log(max(0.001, nrnd0)))*cos(2.0 * PI*nrnd1);
}

float phillips(vec2 k, vec2 windDir, float L, float lMax){
    float kMagnitude = length(k);
    //Avoid division by 0 and NaN values
    if(kMagnitude == 0.0){
    	return 0.0;
    }
    //Stop waves travelling perpendicular to the wind.
    float kw = pow(dot(normalize(k), normalize(windDir)), 2.0);
   	float p = A * (exp(-1.0/(kMagnitude * L * L))/pow(kMagnitude, 4.0)) * kw;
    //Limit waves that are too small.
    return p * exp(-1.0 * kMagnitude * kMagnitude * lMax * lMax);
}




void main() {

	vec4 h = vec4(0);
	float SIZE = 1.0;
	float SIDE = 5.0;

	float RMS = 1.0/sqrt(2.0);

	

	vec2 x = vUv - SIZE/2.0;
	vec2 k = (2.0 * PI * x) / SIDE;
	float L_ = (V * V)/g;


	//Random real and imaginary coefficients.
	float er = gaussianRandom(vUv*1.);
	float ei = gaussianRandom(vUv*10.);
        
	float pk = phillips(k, windDirection, L_, L_ * 1.0e-4);       
 
	h.x = RMS * er * sqrt(pk);
	h.y = RMS * ei * sqrt(pk);
	
	pk = phillips(-k, windDirection, L_, L_ * 1.0e-4);    
	
	h.z = RMS * er * sqrt(pk);
	h.w = RMS * ei * sqrt(pk);


//	vec4 gauss_random = gaussRND();


	//vec4 tilde_h0k = vec4(gaussRND().xy * h0k, 0, 1.0);

//	vec4 tilde_h0k = vec4(gaussRND().xy * pk, 0, 1.0);

	//outColor = gauss_random;	
	//outColor = tilde_h0k;
//	outColor = vec4(kl,0.,1.);
	//outColor = vec4(1., 0., 0., 1.);

	outColor = vec4(h.zw, 0.0, 1.0);
//	outColor = vec4(1., 0., 0., 1.);
}
`;



//***************************************************************************************

/*
//Numerical constant controlling wave height.
const float A = 6.0;

//Root mean square of sinusoid with amplitude 1.
const float RMS = 1.0/sqrt(2.0);

float random(vec2 par){
   return fract(sin(dot(par.xy,vec2(12.9898,78.233))) * 43758.5453);
}

//https://www.shadertoy.com/view/4ssXRX
//http://www.dspguide.com/ch2/6.htm
float gaussianRandom(vec2 seed){
	float nrnd0 = random(seed);
	float nrnd1 = random(seed + 0.1);	
	return sqrt(-2.0*log(max(0.001, nrnd0)))*cos(TWO_PI*nrnd1);
}

//In the paper, vector k is the wave vector or direction and the scalar k is the magnitude.
float phillips(vec2 k, vec2 windDir, float L, float lMax){
    float kMagnitude = length(k);
    //Avoid division by 0 and NaN values
    if(kMagnitude == 0.0){
    	return 0.0;
    }
    //Stop waves travelling perpendicular to the wind.
    float kw = pow(dot(normalize(k), normalize(windDir)), 2.0);
   	float p = A * (exp(-1.0/(kMagnitude * L * L))/pow(kMagnitude, 4.0)) * kw;
    //Limit waves that are too small.
    return p * exp(-1.0 * kMagnitude * kMagnitude * lMax * lMax);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
    
    vec4 h = vec4(0);
    if(fragCoord.x < SIZE && fragCoord.y < SIZE){
        vec2 windDir = iMouse.xy - 0.5*iResolution.xy;
        //Wind speed.
        float V = 4.0;
        //Height of largest wave.
        float L = pow(V, 2.0)/g;

        float n = (fragCoord.x-0.5) - SIZE/2.0;
        float m = (fragCoord.y-0.5) - SIZE/2.0;

        vec2 k = (6.28 * vec2(n, m)) / SIDE;

        //Random real and imaginary coefficients.
        float er = gaussianRandom(fragCoord.xy*0.01);
        float ei = gaussianRandom(fragCoord.xy*0.001);

        float pk = phillips(k, windDir, L, L * 1.0e-4);

        //Equation 25
        h.x = RMS * (er) * sqrt(pk);
        h.y = RMS * (ei) * sqrt(pk);

        //Same for -k
        //Random real and imaginary coefficients.
        er = gaussianRandom((iResolution.xy+fragCoord.xy)*0.01);
        ei = gaussianRandom((iResolution.xy+fragCoord.xy)*0.001);

        pk = phillips(-k, windDir, L, L * 1.0e-4);

        //Equation 25 for -k
        h.z = RMS * (er) * sqrt(pk);
        h.w = RMS * (ei) * sqrt(pk);
        
        vec2 h0_k = h.xy;
        vec2 h0_minus_k = h.zw;

        float dispersion = sqrt(g * length(k))*iTime*2.0;

        vec2 hkt = c_mul(h0_k, c_exp(dispersion)) + 
            c_conj(c_mul(h0_minus_k, c_exp(-dispersion)));
        
        
        h = vec4(hkt, 0.0, 1.0);

    }
    
    fragColor = h;
}
*/