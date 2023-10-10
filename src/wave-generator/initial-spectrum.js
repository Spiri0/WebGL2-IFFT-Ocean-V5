import {THREE} from '../three-defs.js';
import {entity} from '../entity.js';

import { commonVS } from "../../resources/shader/IFFT/commonVS.js";
import { h0kSpectrumFS } from "../../resources/shader/IFFT/h0kSpectrumFS.js";
import { h0kInvStarSpectrumFS } from "../../resources/shader/IFFT/h0kInvStarSpectrumFS.js";



export const initial_spectrum = (() => {

	class InitialSpectrum extends entity.Component {
		constructor(params) {
			super();
			this.Init(params);
    }


		Init(params) {
			this.params_ = params;


			let BaseParams = {
				format: THREE.RGBAFormat,
				stencilBuffer: false,
				depthBuffer: false,
				premultiplyAlpha: false,
				type: THREE.FloatType
			};
			//NRP = NearestRepeatParams
			let NRP = JSON.parse(JSON.stringify(BaseParams));	
			NRP.minFilter = NRP.magFilter = THREE.NearestFilter;
			NRP.wrapS = NRP.wrapT = THREE.RepeatWrapping;
			
			
				
			this.h0kSpectrumFramebuffer = new THREE.WebGLRenderTarget(params.size, params.size, NRP);
			this.h0SpectrumFramebuffer = new THREE.WebGLRenderTarget(params.size, params.size, NRP);
			
				
			this.textureCamera = new THREE.Camera();	
			this.screenQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));

			
			// 1a - h0k Spectrum			
			this.materialH0kSpectrum = new THREE.RawShaderMaterial({ 
				glslVersion: THREE.GLSL3,
				uniforms: {
					wind: {value: new THREE.Vector2(10, 10)},
					size: {value: params.size},
					scale: {value: params.scale},
				}, 
				vertexShader: commonVS, 
				fragmentShader: h0kSpectrumFS, 
				depthTest: false,
				blending: 0
			});		
			this.H0kSpectrum(this.params_);

		
			// 1b - h0kInvStar Spectrum
			this.materialH0kInvStarSpectrum = new THREE.RawShaderMaterial({ 
				glslVersion: THREE.GLSL3,
				uniforms: {
					h0k: {value: this.h0kSpectrumFramebuffer.texture},
					size: {value: params.size},
				}, 
				vertexShader: commonVS, 
				fragmentShader: h0kInvStarSpectrumFS, 
				depthTest: false,
				blending: 0
			});		
			this.H0kInvStarSpectrum(this.params_);
		
		}


		H0kSpectrum(params){	
			// 1. h0k Spectrum
			this.screenQuad.material = this.materialH0kSpectrum;
			this.h0kSpectrumFramebuffer.texture.needsUpdate = true;
			params.renderer.setRenderTarget(this.h0kSpectrumFramebuffer);
			params.renderer.render(this.screenQuad, this.textureCamera);
			params.renderer.setRenderTarget(null);		
		}


		H0kInvStarSpectrum(params){	
			// 1. h0k inverse conj Spectrum
			this.screenQuad.material = this.materialH0kInvStarSpectrum;
			this.h0SpectrumFramebuffer.texture.needsUpdate = true;
			params.renderer.setRenderTarget(this.h0SpectrumFramebuffer);
			params.renderer.render(this.screenQuad, this.textureCamera);
			params.renderer.setRenderTarget(null);		
		}


		Update(_) {
		}

  }


  return {
      InitialSpectrum: InitialSpectrum,
  };

})();