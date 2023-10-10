import {THREE} from '../three-defs.js';
import {entity} from '../entity.js';

import { commonVS } from "../../resources/shader/IFFT/commonVS.js";
import { butterflyFS } from "../../resources/shader/IFFT/butterflyFS.js";
import { wave_cascade } from "./wave-cascade.js";


export const wave_generator = (() => {

	class WaveGenerator extends entity.Component {
		constructor(params) {
			super();
			this.Init(params);
    }


		Init(params) {
			this.params_ = params;
			
			this.textureCamera = new THREE.Camera();	
			this.screenQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));

			this.size = 512;
			this.WndSpd = 20.0;
			this.WndHdg = 0.0;
			this.Choppy = 1.25;
			this.WavMax = 5;
			this.WaveSpd = 2;


			let BaseParams = {
				format: THREE.RGBAFormat,
				stencilBuffer: false,
				depthBuffer: false,
				premultiplyAlpha: false,
				type: THREE.FloatType
			};

			let NCP = JSON.parse(JSON.stringify(BaseParams));	
			NCP.minFilter = NCP.magFilter = THREE.NearestFilter;
			NCP.wrapS = NCP.wrapT = THREE.ClampToEdgeWrapping;

	
			this.butterflyFramebuffer = new THREE.WebGLRenderTarget(Math.log2(this.size), this.size, NCP);

			
			this.materialButterfly = new THREE.RawShaderMaterial({ 
				glslVersion: THREE.GLSL3,
				uniforms: { 
					size: {value: this.size},
				}, 
				vertexShader: commonVS, 
				fragmentShader: butterflyFS, 
				depthTest: false,
				blending: 0
			});
			
			this.ButterflyMap(this.params_);
			this.butterflyTexture = this.butterflyFramebuffer.texture;



			this.scale = [512, 128, 32];


			this.cascades = [];	

			for(let i = 0; i < 3; i++){
				this.cascades.push(new wave_cascade.WaveCascade({...this.params_, ...this.CascadeParams(i)}));
			}

		
		}


		CascadeParams(i){
			return {
				size: this.size,
				scale: this.scale[i],
				butterfly: this.butterflyTexture,
			};	
		}


		Update(_) {
	
			for(let i = 0; i < this.cascades.length; i++){
				this.cascades[i].Update();			
			}	
		}


		ButterflyMap(params){
			this.screenQuad.material = this.materialButterfly;
			this.butterflyFramebuffer.texture.needsUpdate = true;			
			params.renderer.setRenderTarget(this.butterflyFramebuffer);
			params.renderer.render(this.screenQuad, this.textureCamera);			
			params.renderer.setRenderTarget(null);			
		}


  }


  return {
      WaveGenerator: WaveGenerator,
  };

})();