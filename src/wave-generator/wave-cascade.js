import {THREE} from '../three-defs.js';
import {entity} from '../entity.js';

import { initial_spectrum } from "./initial-spectrum.js";
import { commonVS } from "../../resources/shader/IFFT/commonVS.js";
import { timeSpectrumFS } from "../../resources/shader/IFFT/timeSpectrumFS.js";
import { IFFTHorizontalFS } from "../../resources/shader/IFFT/IFFT-HorizontalFS.js";
import { IFFTVerticalFS } from "../../resources/shader/IFFT/IFFT-VerticalFS.js";
import { normalFS } from "../../resources/shader/IFFT/normalFS.js";



export const wave_cascade = (() => {

	class WaveCascade extends entity.Component {
		constructor(params) {
			super();
			this.Init(params);
    }


		Init(params) {
			this.params_ = params;
	
	
			//params.size = params.size;
			//this.waveScale = params.scale;				// Size of Smallest Grid Square (meters)
			this.WndSpd = 20.0;
			this.WndHdg = 0.0;
			this.Choppy = 1.25;
			this.WavMax = 5;						// Maximum wave height (set height of outer waves)
			this.envMap = 0;
			this.WaveSpd = 2;

	
			this.textureCamera = new THREE.Camera();	
			this.screenQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));



			let BaseParams = {
				format: THREE.RGBAFormat,
				stencilBuffer: false,
				depthBuffer: false,
				premultiplyAlpha: false,
				type: THREE.FloatType
			};
			// Set Parameters
			//NRP = NearestRepeatParams
			//NCP = NearestClampParams
			//LRP = LinearRepeatParams
			let NRP = JSON.parse(JSON.stringify(BaseParams));	
			NRP.minFilter = NRP.magFilter = THREE.NearestFilter;
			NRP.wrapS = NRP.wrapT = THREE.RepeatWrapping;
			let NCP = JSON.parse(JSON.stringify(BaseParams));	
			NCP.minFilter = NCP.magFilter = THREE.NearestFilter;
			NCP.wrapS = NCP.wrapT = THREE.ClampToEdgeWrapping;
			let LRP = JSON.parse(JSON.stringify(BaseParams));
			LRP.minFilter = THREE.LinearMipMapLinearFilter;		
			LRP.generateMipmaps = true;
			LRP.magFilter = THREE.LinearFilter;
			LRP.wrapS = LRP.wrapT = THREE.RepeatWrapping;


			this.spectrumFramebuffer = new THREE.WebGLRenderTarget(params.size, params.size, NCP);
			this.pingFramebuffer = new THREE.WebGLRenderTarget(params.size, params.size, NCP);
			this.pongFramebuffer = new THREE.WebGLRenderTarget(params.size, params.size, NCP);
			this.displacementFramebuffer = new THREE.WebGLRenderTarget(params.size, params.size, LRP);
			this.normalFramebuffer = new THREE.WebGLRenderTarget(params.size, params.size, LRP);
			
			
			this.initialSpectrum = new initial_spectrum.InitialSpectrum(params);

			this.h0k = this.initialSpectrum.h0kSpectrumFramebuffer;
			this.h0 = this.initialSpectrum.h0SpectrumFramebuffer;

	
	
			// 2 - Time Spectrum
			this.materialSpectrum = new THREE.RawShaderMaterial({ 
				glslVersion: THREE.GLSL3,
				uniforms: { 
					grdsiz: {value: params.scale},
					grdres: {value: params.size},
					choppy: {value: this.Choppy},
					begFFT: {value: null},
					time: {value: 0},
				}, 
				vertexShader: commonVS, 
				fragmentShader: timeSpectrumFS, 
				depthTest: false,
				blending: 0
			});
	
			const u_displacement = {
				u_input: {value: null},
				size: {value: params.size},
				bfw: {value: Math.log2(params.size) - 1},
				butterfly: {value: params.butterfly},
				step: {value: null},
			}
						
			// 3 - Fragment Shader - Displacement Map
			// 3A - Horizontal wave vertices used for FFT
			this.materialOceanHorizontal = new THREE.RawShaderMaterial({ 
				glslVersion: THREE.GLSL3,
				uniforms: u_displacement,
				vertexShader: commonVS,	
				fragmentShader: IFFTHorizontalFS,
				depthTest: false,
				blending: 0
			});
	
			// 3B - Vertical wave vertices used for FFT
			this.materialOceanVertical  = new THREE.RawShaderMaterial({ 
				glslVersion: THREE.GLSL3,
				uniforms: u_displacement,
				vertexShader: commonVS,	
				fragmentShader: IFFTVerticalFS,
				depthTest: false,
				blending: 0
			});			

			// 4 - Fragment Shader - Normal Map
			this.materialNormal = new THREE.RawShaderMaterial({ 
				glslVersion: THREE.GLSL3,
				uniforms: {
					displacementMap: {value: null},
					grdsiz: {value: params.scale},
					grdres: {value: params.size},
				},
				vertexShader: commonVS,	
				fragmentShader: normalFS,
				depthTest: false,
				blending: 0
			});
		
		}


		TimeSpectrum(params){
			// 2. hkt time Spectrum
			this.screenQuad.material = this.materialSpectrum;
			this.materialSpectrum.uniforms.begFFT.value = this.h0.texture;
			this.materialSpectrum.uniforms.time.value += 0.025;
			this.materialSpectrum.uniformsNeedUpdate = true;			
			params.renderer.setRenderTarget(this.spectrumFramebuffer);
			params.renderer.render(this.screenQuad, this.textureCamera);
			params.renderer.setRenderTarget(null);
		}


		Update(_) {
	
			this.TimeSpectrum(this.params_);
			this.DisplacementMap(this.params_);
			this.NormalMap(this.params_);
		}


		DisplacementMap(params){	
			// 3. Displacement texture
			let iterations = Math.log2(params.size);
					
			let pingPong = false;
			this.pingFramebuffer = this.spectrumFramebuffer;

			this.screenQuad.material = this.materialOceanHorizontal;
			
			for (let i = 0; i < iterations; i++) {
				pingPong = !pingPong;
				this.inputBuffer = pingPong ? this.pingFramebuffer : this.pongFramebuffer;
				this.frameBuffer = pingPong ? this.pongFramebuffer : this.pingFramebuffer;			
				this.materialOceanHorizontal.uniforms.step.value = i;
				this.materialOceanHorizontal.uniforms.u_input.value = this.inputBuffer.texture;
				this.ComputeFrameBuffer(this.frameBuffer);
			}
	
			this.screenQuad.material = this.materialOceanVertical;	
		
			for (let i = 0; i < iterations; i++) {
				pingPong = !pingPong;
				this.inputBuffer = pingPong ? this.pingFramebuffer : this.pongFramebuffer;
				this.frameBuffer = pingPong ? this.pongFramebuffer : this.pingFramebuffer;
				this.materialOceanVertical.uniforms.step.value = i;
				this.materialOceanVertical.uniforms.u_input.value = this.inputBuffer.texture;
				this.ComputeFrameBuffer(this.frameBuffer);
			}			
					
			// Final Render to Displacement texture
			this.frameBuffer = this.displacementFramebuffer;
			this.ComputeFrameBuffer(this.frameBuffer);
		}


		ComputeFrameBuffer(frameBuffer){
			this.screenQuad.material.uniformsNeedUpdate = true;
			this.params_.renderer.setRenderTarget(frameBuffer);
			this.params_.renderer.render(this.screenQuad, this.textureCamera);
			this.params_.renderer.setRenderTarget(null);				
		}


		NormalMap(params){
			// 4. Normal texture
			this.screenQuad.material = this.materialNormal;
			this.normalFramebuffer.texture.needsUpdate = true;						
			this.materialNormal.uniforms.displacementMap.value = this.displacementFramebuffer.texture;
			this.materialNormal.uniformsNeedUpdate = true;	
			params.renderer.setRenderTarget(this.normalFramebuffer);
			params.renderer.render(this.screenQuad, this.textureCamera);			
			params.renderer.setRenderTarget(null);		
		}


  }


  return {
      WaveCascade: WaveCascade,
  };

})();
