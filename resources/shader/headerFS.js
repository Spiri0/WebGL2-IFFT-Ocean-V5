export const headerFS = `

	#define PI 3.141592653589793238
	#define FLT_MAX 3.402823466e+38

	precision highp float;
	precision highp int;
	precision highp sampler2DArray;
	precision highp sampler3D;
	precision highp sampler2D;

	uniform float time;

	uniform mat4 modelMatrix;
	uniform mat4 modelViewMatrix;
	uniform vec3 cameraPosition;
	uniform vec3 sunPosition;
	uniform vec3 color;
	uniform vec4 neighbours;

	uniform float minRadius;
	uniform float numLayers;

	uniform float lod;

	uniform sampler2D vertexTexture;
	uniform sampler2D normalTexture;

	uniform sampler2D noiseTexture;
	
	uniform sampler2D normalMap0;
	uniform sampler2D normalMap1;
	uniform sampler2D normalMap2;
	uniform sampler2D displacementMap0;
	uniform sampler2D displacementMap1;
	uniform sampler2D displacementMap2;

	in vec3 vNormal;
	in vec3 vPosition;
	//in vec3 vPosD;
	in float idx;


	out vec4 outColor;
	
	
	#define saturate(a) clamp( a, 0.0, 1.0 )	

`;