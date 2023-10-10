import {THREE, RenderPass, ShaderPass, EffectComposer, CopyShader} from './three-defs.js';
import {entity} from "./entity.js";


export const threejs_component = (() => {

	class ThreeJSController extends entity.Component {
		constructor() {
			super();
		}

		InitEntity() {

			const canvas = document.createElement('canvas');
			const context = canvas.getContext('webgl2');
		
			this.threejs_ = new THREE.WebGLRenderer({ 
				canvas: canvas,
				context: context,
				antialias: true
			});
    	
			//this.threejs_.outputEncoding = THREE.sRGBEncoding;
			this.threejs_.setPixelRatio(window.devicePixelRatio);
			this.threejs_.shadowMap.enabled = true;
			this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
			this.threejs_.physicallyCorrectLights = true;
			this.threejs_.domElement.id = 'threejs';
					
			this.container = document.getElementById('container');
			this.threejs_.setSize(this.container.clientWidth, this.container.clientHeight);
			this.container.appendChild( this.threejs_.domElement );
					
			const aspect = this.container.clientWidth / this.container.clientHeight; 
			const fov = 50;
			const near = 0.1;
			const far = 1E6;
			this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
			this.scene_ = new THREE.Scene();
			this.threejs_.setClearColor( 0x87ceeb );



			//const frustum = new THREE.Frustum();


			this.composer_ = new EffectComposer(this.threejs_);
			const renderPass = new RenderPass(this.scene_, this.camera_);
			this.composer_.addPass(renderPass);


			window.addEventListener('resize', () => {
				this.OnResize_();
			}, false);
		}


		Render() {

			this.threejs_.render(this.scene_, this.camera_); 
			this.composer_.render();
			
		}


		Update(timeElapsed) {

		}
    
    
		OnResize_() {
		
			let width, height;
		
			if(window.innerWidth > window.innerHeight){	
				width = 1.0 * window.innerWidth;
				height = 1.0 * window.innerHeight;				
			}		
			if(window.innerHeight > window.innerWidth){	
				width = 1.0 * window.innerWidth;
				height = 1.0 * window.innerHeight;				
			}		
			this.camera_.aspect = width / height;
			this.camera_.updateProjectionMatrix();
			this.threejs_.setSize(width, height);	
		}
  
  }//end class


  return {
      ThreeJSController: ThreeJSController,
  };
})();