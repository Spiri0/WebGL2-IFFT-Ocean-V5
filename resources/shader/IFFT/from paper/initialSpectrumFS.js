export const initialSpectrumFS = `

	#define PI 3.141592653589793238
	#define FLT_MAX 3.402823466e+38
	#define g 9.81

	precision highp float;
	precision highp int;
	precision highp sampler2DArray;
	precision highp sampler3D;
	precision highp sampler2D;
	
	
	in vec2 vUv;

	out vec4 outColor;

	//*************************************************


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
	return sqrt(-2.0*log(max(0.001, nrnd0)))*cos(2.0*PI*nrnd1);
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





void main(){


float SIZE = 1.0;
float SIDE = 4.0;
 
float SCALE = 1.0;
float SHIFT = 1.;
 
 
    vec4 h = vec4(0);

        vec2 windDir = normalize(vec2(1.,1.));
        //Wind speed.
        float V = 4.0;
        //Height of largest wave.
        float L = V * V/g;

        vec2 x = vUv - 0.5;
        vec2 k = (2.0*PI * x) / SIDE;

        //Random real and imaginary coefficients.
        float er = gaussianRandom(vUv*10.0);
        float ei = gaussianRandom(vUv*1.0);

        float pk = phillips(k, windDir, L, L * 1.0e-4);

        //Equation 25
        h.x = RMS * er * sqrt(pk);
        h.y = RMS * ei * sqrt(pk);

        //Same for -k
        //Random real and imaginary coefficients.
        er = gaussianRandom(SHIFT + vUv*10.0);
        ei = gaussianRandom(SHIFT + vUv*1.0);

        pk = phillips(-k, windDir, L, L * 1.0e-4);

        //Equation 25 for -k
        h.z = RMS * er * sqrt(pk);
        h.w = RMS * ei * sqrt(pk);
        
        vec2 h0_k = h.xy;
        vec2 h0_minus_k = h.zw;


    outColor = h;
}
`;



//***************************************************************************************