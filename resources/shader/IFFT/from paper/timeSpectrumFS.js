export const timeSpectrumFS = `

	#define PI 3.141592653589793238
	#define FLT_MAX 3.402823466e+38
	#define g 9.81
	
	
	precision highp float;
	precision highp int;
	precision highp sampler2DArray;
	precision highp sampler3D;
	precision highp sampler2D;

	uniform sampler2D initialSpectrum;
	uniform float time;
	
	in vec2 vUv;

	out vec4 outColor;





	//************************************

	vec2 c_mul(vec2 a, vec2 b){
		return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
	}

	vec2 c_conj(vec2 a){
		return vec2(a.x, -a.y);
	}

	vec2 c_exp(float x){
		return vec2(cos(x), sin(x));
	}

/*
	void main() {

		vec4 col = vec4(0., 0., 0., 1.);

		float SIDE = 4.0;
		float SPEED = 2.0;
	
		vec2 x = vUv - 0.5;
		vec2 k = (2.0 * PI * x) / SIDE;

		float magn = length(k);
		float w = sqrt(g * magn);


		vec2 exp_iwt = vec2(cos(w*time), sin(w*time));
		vec2 exp_iwt_inv = vec2(cos(w*time), -sin(w*time));

		vec2 h0k = texture(initialSpectrum, vUv).xy;
		vec2 h0k_inv = texture(initialSpectrum, vUv).zw;

		
//		c_mul(h0k, exp_iwt), c_mul(h0k_inv, exp_iwt_inv)





		vec2 hkt = c_mul(h0k, c_exp(w)) + c_conj(c_mul(h0k_inv, c_exp(-w)));

		col.rg = hkt;


		outColor = col;
		

		//		outColor = vec4(h0k, 0., 1.);
//		outColor = vec4(h0k_inv, 0., 1.);
//		outColor = vec4(h0k - h0k_inv, 0., 1.);
	}
*/



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

float SIZE = 800.0;
float SIDE = 500.0;
 
float SCALE = 800.0;
float SHIFT = 0.;
 
 
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
        

        float dispersion = sqrt(g * length(k))*time;

        vec2 hkt = 2000.*c_mul(h0_k, c_exp(dispersion)) + c_conj(c_mul(h0_minus_k, c_exp(-dispersion)));
        
        
        h = vec4(hkt, 0., 1.0);

  
    outColor = h;
    
   // outColor = vec4(1.,0.,0.,1.);
}
	
`;



/*
complex fourier_amp;

    fourier_amp.real = h0k.x;
    fourier_amp.im   = h0k.y;

    complex fourier_amp_conj;

    fourier_amp_conj.real = h0minusk.x;
    fourier_amp_conj.im   = h0minusk.y;

    fourier_amp_conj = conjugate(fourier_amp_conj);

    float consinus = cos(w * u_Time);
    float sinus    = sin(w * u_Time);

    complex exp_iwkt;

    exp_iwkt.real = consinus;
    exp_iwkt.im   = sinus;

    complex exp_iwkt_minus;

    exp_iwkt_minus.real = consinus;
    exp_iwkt_minus.im   = -sinus;

    // dy
    complex d_k_t_dy = add(mul(fourier_amp, exp_iwkt), mul(fourier_amp_conj, exp_iwkt_minus));

    // dx
    complex dx;

    dx.real = 0.0;
    dx.im   = -k.x / k_mag;

    complex d_k_t_dx = mul(dx, d_k_t_dy);

    // dz
    complex dy;

    dy.real = 0.0;
    dy.im   = -k.y / k_mag;

    complex d_k_t_dz = mul(dy, d_k_t_dy);

    imageStore(tilde_hkt_dx, ivec2(gl_GlobalInvocationID.xy), vec4(d_k_t_dx.real, d_k_t_dx.im, 0.0, 1.0));
    imageStore(tilde_hkt_dy, ivec2(gl_GlobalInvocationID.xy), vec4(d_k_t_dy.real, d_k_t_dy.im, 0.0, 1.0));
    imageStore(tilde_hkt_dz, ivec2(gl_GlobalInvocationID.xy), vec4(d_k_t_dz.real, d_k_t_dz.im, 0.0, 1.0));
}

// ------------------------------------------------------------------
*/