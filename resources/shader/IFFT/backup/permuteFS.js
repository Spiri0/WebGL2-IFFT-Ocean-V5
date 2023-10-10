export const permuteFS = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;
	
	#define PI 3.141592653589793238
	
	in vec2 vUv;
	out vec4 outColor;

	uniform sampler2D u_input;

	vec2 multiplyComplex(vec2 a, vec2 b){
		return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
	}
	
	void main(){

		
		

		
		vec4 inputTex1 = texture(u_input, vUv);
		vec4 inputTex2 = texture(u_input, vUv * 12.0);
		vec4 inputTex3 = texture(u_input, vUv * 40.0);

    vec4 result = inputTex1 + inputTex2 + inputTex3;// * (1.0 - 2.0 * mod(vUv.x * 512.0 + vUv.y * 512.0, 2.0));

    //textureStore(OutputBuffer, iid.xy, input * (1.0 - 2.0 * f32((iid.x + iid.y) % 2)));
/*
		float step = floor(vUv.x * 9.0);
		float 	subtransform = pow(2.0, step + 1.0);
		float index = vUv.y * 512.0 ;		// horizontal

		float evenIndex = floor(index / subtransform) * (subtransform * 0.5) + mod(index, subtransform * 0.5);

		//vec4 even = texture(u_input, vec2(evenIndex+0.5, gl_FragCoord.y)/transformSize).rgba;
		//vec4 odd = texture(u_input, vec2(evenIndex + transformSize*0.5+0.5, gl_FragCoord.y)/transformSize).rgba;


		float twiddleArgument = -2.0*PI*(index/subtransform);
		vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));
		//vec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);
		//vec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);
		//outColor = vec4(outputA,outputB);	
*/

	//	outColor = vec4(twiddle.x, -twiddle.y, evenIndex/512.0, 0.);	



		
		outColor = result;
		
	}
`;



/*

		vec4 data = texture(butterfly, vec2(step/8.0, vUv.x));
		vec2 inputsIndices = data.ba;
		
		vec4 input0 = texture(u_input, vec2(inputsIndices.x, vUv.y));
		vec4 input1 = texture(u_input, vec2(inputsIndices.y, vUv.y));

		vec4 result = vec4(input0.xy + multiplyComplex(vec2(data.r, -data.g), input1.xy), 0., 0.);
	
		outColor = result;
		
		
@group(0) @binding(5) var InputBuffer : texture_2d<f32>;
@group(0) @binding(6) var OutputBuffer : texture_storage_2d<rg32float, write>;

@compute @workgroup_size(8,8,1)
fn permute(@builtin(global_invocation_id) id : vec3<u32>)
{
    let iid = vec3<i32>(id);
    let input = textureLoad(InputBuffer, iid.xy, 0);

    textureStore(OutputBuffer, iid.xy, input * (1.0 - 2.0 * f32((iid.x + iid.y) % 2)));
}
*/