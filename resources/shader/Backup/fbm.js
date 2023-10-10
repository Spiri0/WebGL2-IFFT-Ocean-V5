export const fbm = `


float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}



float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));	
    return fract(sin(h)*43758.5453123);
}
float noiseFBM3(vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );	
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

// sea
const int ITER_GEOMETRY = 3;
const int ITER_FRAGMENT = 3;
const float SEA_HEIGHT = 0.6;
const float SEA_CHOPPY = 4.0;
const float SEA_SPEED = 0.8;
const float SEA_FREQ = 0.16;
const vec3 SEA_BASE = vec3(.2,0.5,0.55);
const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
#define SEA_TIME (1.0 + time * SEA_SPEED)
const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);

// sea
float sea_octave(vec2 uv, float choppy) {
    uv += noiseFBM3(uv);        
    vec2 wv = 1.0-abs(sin(uv));
    vec2 swv = abs(cos(uv));    
    wv = mix(wv,swv,wv);
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

float map(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; 
    uv.x *= 0.75;
    
    float d = 0.0;
    float h = 0.0;  
      
    for(int i = 0; i < ITER_GEOMETRY; i++) { 
           
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
    	
     h += d * amp;        
    	uv *= octave_m; 
    	freq *= 1.9; 
    	amp *= 0.22;
     choppy = mix(choppy,1.0,0.2);
       
    }
    return p.y - h;
}


float map_detailed(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;
    
    float d, h = 0.0;    
    for(int i = 0; i < ITER_FRAGMENT; i++) {        
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
        h += d * amp;        
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}






#define DRAG_MULT 0.28 // changes how much waves pull on the water
#define WATER_DEPTH 1.0 // how deep is the water
#define CAMERA_HEIGHT 1.5 // how high the camera should be
#define ITERATIONS_RAYMARCH 12 // waves iterations of raymarching
#define ITERATIONS_NORMAL 40 /

// Calculates wave value and its derivative, 
// for the wave direction, position in space, wave frequency and time
vec2 wavedx(vec2 position, vec2 direction, float frequency, float timeshift) {
  float x = dot(direction, position) * frequency + timeshift;
  float wave = exp(sin(x) - 1.0);
  float dx = wave * cos(x);
  return vec2(wave, -dx);
}

float getwaves(vec2 position, int iterations) {

  float iter = 0.0; // this will help generating well distributed wave directions
  float frequency = 1.0; // frequency of the wave, this will change every iteration
  float timeMultiplier = 2.0; // time multiplier for the wave, this will change every iteration
  float weight = 1.0;// weight in final sum for the wave, this will change every iteration
  float sumOfValues = 0.0; // will store final sum of values
  float sumOfWeights = 0.0; // will store final sum of weights
  
  for(int i=0; i < iterations; i++) {
    // generate some wave direction that looks kind of random
    vec2 p = vec2(sin(iter), cos(iter));
    // calculate wave data
    vec2 res = wavedx(position, p, frequency, time * timeMultiplier);

    // shift position around according to wave drag and derivative of the wave
    position += p * res.y * weight * DRAG_MULT;

    // add the results to sums
    sumOfValues += res.x * weight;
    sumOfWeights += weight;

    // modify next octave parameters
    weight *= 0.82;
    frequency *= 1.18;
    timeMultiplier *= 1.07;

    // add some kind of random value to make next wave look random too
    iter += 1232.399963;
  }
  
  // calculate and return
  return sumOfValues / sumOfWeights;
}








float noiseFBM2(vec2 x){
    vec2 f = fract(x);
    vec2 u = f*f*(3.0-2.0*f);
  
    vec2 p = floor(x);
	float a = textureLod( noiseTexture, (p+vec2(0.5,0.5))*0.00390625, 0.0 ).x;
	float b = textureLod( noiseTexture, (p+vec2(1.5,0.5))*0.00390625, 0.0 ).x;
	float c = textureLod( noiseTexture, (p+vec2(0.5,1.5))*0.00390625, 0.0 ).x;
	float d = textureLod( noiseTexture, (p+vec2(1.5,1.5))*0.00390625, 0.0 ).x;
    
	float res = (a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y);
    res = res - 0.5;
    return res;
}



float noiseFBM(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}



const float angle = 3.14;
const float s = sin(angle);
const float c = cos(angle);
const mat2 rotation = mat2(c, s, -s, c);
const float HEIGHT = 5.0;
const float SCALE = 0.035;
float waveSpeed = 0.035;


float fbm(vec2 pos){

    float res = 0.0;
    float freq = 1.0;
    float amp = 1.0;
    
    for(int i = 0; i < 9; i++){ 
        if(i == 4){break;}

       	res +=amp * noiseFBM3(freq*(pos + time*(waveSpeed*float(9-i+1))));

        freq *= 1.75;
        amp *= 0.5;
        
        pos *= rotation;
    }
	return res;
}


float getHeight(vec3 pos){
    return HEIGHT * fbm(SCALE * pos.xz);
  //  return HEIGHT * getwaves(5.*SCALE * pos.xz, 10);
 // return HEIGHT * map(SCALE * pos);
//  return HEIGHT * map_detailed(0.1* pos);
//		return map(0.5 * pos) + map_detailed(0.5* pos);
}







`;