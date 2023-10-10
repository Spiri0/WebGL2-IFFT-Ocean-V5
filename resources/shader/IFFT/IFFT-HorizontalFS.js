export const IFFTHorizontalFS = `

	precision highp float;
	precision highp int;
	precision highp sampler2D;
	
	out vec4 outColor;

	uniform sampler2D u_input;
	uniform sampler2D butterfly;
	uniform float step;
	uniform float bfw;
	uniform float size;
	
	vec2 multiplyComplex(vec2 a, vec2 b){
		return vec2(a.x * b.x - a.y * b.y, a.y * b.x + a.x * b.y);
	}
	
	void main(){

		vec4 data = texture(butterfly, vec2(step/bfw, gl_FragCoord.x/size));

		vec4 even = texture(u_input, vec2(data.z, gl_FragCoord.y/size));
		vec4 odd = texture(u_input, vec2(data.w, gl_FragCoord.y/size));

		vec2 outputA = even.xy + multiplyComplex(data.rg, odd.xy);
		vec2 outputB = even.zw + multiplyComplex(data.rg, odd.zw);
		outColor = vec4(outputA,outputB);	
	}
`;


/*	
		vec4 color = vec4(0., 0., 0., 0.);	
		
		if(int(step) == 0){color = vec4(0.1, 0.1, 0.1, 0.);	}
		if(int(step) == 1){color = vec4(0., 0., 1., 0.);	}
		if(int(step) == 2){color = vec4(0., 1., 0., 0.);	}
		if(int(step) == 3){color = vec4(0., 1., 1., 0.);	}
		if(int(step) == 4){color = vec4(1., 0., 0., 0.);	}
		if(int(step) == 5){color = vec4(1., 0., 1., 0.);	}
		if(int(step) == 6){color = vec4(1., 1., 0., 0.);	}
		if(int(step) == 7){color = vec4(1., 1., 1., 0.);	}
		if(int(step) == 8){color = vec4(0., 0., 0., 0.);	}
		if(int(step) == 9){color = vec4(0., 0., 1., 0.);	}


		outColor = color;
*/		