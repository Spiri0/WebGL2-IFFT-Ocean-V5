export const butterflyFS = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;
	
	#define PI 3.141592653589793238
	
	in vec2 vUv;
	out vec4 outColor;

	uniform float size;

	vec2 multiplyComplex(vec2 a, vec2 b){
		return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
	}

float bitReverse(int value) {
    int numBits = int(log(size)/log(2.0));
    int result = 0;
    for(int i = 0; i < numBits; i = i + 1) {
        result = result | (((value >> i) & 1) << (numBits - 1 - i));
    }
    return float(result)/size;
}

	void main(){

		float N = size;
		
		float posX = floor(vUv.x * log(size)/log(2.0));
		float posY = floor(vUv.y * N);
		
		float k = mod(posY * N/pow(2.0, posX + 1.0), N);
		vec2 twiddle = vec2(cos(2.0 * PI * k / N), sin(2.0 * PI * k / N));
		float butterflyspan = pow(2.0, posX);
		float butterflywing = 0.0;

		if(mod(posY, pow(2.0, posX + 1.0 )) < pow(2.0, posX)){
			butterflywing = 1.0;
		}
		else{
			butterflywing = 0.0;
		}

		if(posX == 0.0){
			if(butterflywing == 1.0){
				outColor = vec4(twiddle.x, twiddle.y, bitReverse(int(posY)), bitReverse(int(posY + 1.0)));
			}
			else{
				outColor = vec4(twiddle.x, twiddle.y, bitReverse(int(posY - 1.0)), bitReverse(int(posY)));
			}		
		}
		else{
			if(butterflywing == 1.0){
				outColor = vec4(twiddle.x, twiddle.y, posY/N, (posY + butterflyspan)/N);
			}
			else{
				outColor = vec4(twiddle.x, twiddle.y, (posY - butterflyspan)/N, posY/N);
			}		
		}
	}
`;