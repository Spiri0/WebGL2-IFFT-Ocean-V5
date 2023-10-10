const customVertexShader = `

	precision highp float;
	precision highp sampler2D;

	uniform mat4 modelMatrix;
	uniform mat4 modelViewMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 projectionMatrix;
	uniform vec3 cameraPosition;

	uniform sampler2D displacementMap;

	// Attributes
	in vec3 position;
	in vec3 normal;
	in vec2 uv;

	// Outputs
	out vec3 vNormal;
	out vec3 vPosition;
	out vec2 vUV;


	void main(){

		vPosition = position;
		vNormal = normalize(normal);
		vUV = uv;

		vec3 displacedPosition;

		vec3 displacement = texture(displacementMap, uv).rgb;

		displacedPosition.x = position + vec3(1., 0., 0.) * displacement.r;
		displacedPosition.y = position + vec3(0., 1., 0.) * displacement.g;
		displacedPosition.z = position + vec3(1., 0., 1.) * displacement.b;

		gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
	}
`;