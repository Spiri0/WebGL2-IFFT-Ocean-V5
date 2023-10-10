import {THREE, ShaderPass} from './three-defs.js';
import {entity} from './entity.js';
import {threejs_component} from './threejs-component.js';
import {entity_manager} from './entity-manager.js';
import {BasicController} from './basic-controller.js'; 
import {ocean} from './ocean/ocean.js';

import {wave_generator} from './wave-generator/wave-generator.js';
import { commonVS } from "../resources/shader/IFFT/commonVS.js";
import { testFS } from "../resources/shader/IFFT/testFS.js";



class Main {

	constructor(){
	}

	Initialize() {   
		this.entityManager_ = new entity_manager.EntityManager();
		this.OnGameStarted();
	}

	OnGameStarted() {
		this.clock_ = new THREE.Clock();
		this.LoadControllers();
		this.previousRAF = null;
		this.RAF();
	}


  LoadControllers() {
  
		const threejs = new entity.Entity();
    	threejs.AddComponent(new threejs_component.ThreeJSController());
    	this.entityManager_.Add(threejs, 'threejs');

    	this.scene_ = threejs.GetComponent('ThreeJSController').scene_;
    	this.camera_ = threejs.GetComponent('ThreeJSController').camera_;
    	this.threejs_ = threejs.GetComponent('ThreeJSController');
		this.composer_ = threejs.GetComponent('ThreeJSController').composer_;

		const basicParams = {
			scene: this.scene_,
			camera: this.camera_,
		};

		//------------------------------------------------------------------------------------------------------------------------------------------

		this.camera_.position.set(0, 1000, 0);
		this.player = new BasicController(basicParams);

		//this.scene_.position.set(10000, 0, 0);
		this.scene_.position.set(0, 0, 0);

		//***********************************************************************************
		const wave_ = new entity.Entity();
		wave_.AddComponent(
			new wave_generator.WaveGenerator({
				renderer: this.threejs_.threejs_,
				clock: this.clock_,
			})
		);
		this.entityManager_.Add(wave_, 'wave');		

		//***********************************************************************************
		//***********************Multithreading-Quadtree-Ocean****************************
		
		const ocean_ = new entity.Entity();
		ocean_.AddComponent(
			new ocean.OceanChunkManager({
				camera: this.camera_,
				scene: this.scene_,
				threejs: this.threejs_,
				sunpos: new THREE.Vector3(100000, 0, 100000),
				clock: this.clock_,
				//wireframe: true,
				displacementMap0: wave_.components_.WaveGenerator.cascades[0].displacementFramebuffer.texture,
				displacementMap1: wave_.components_.WaveGenerator.cascades[1].displacementFramebuffer.texture,
				displacementMap2: wave_.components_.WaveGenerator.cascades[2].displacementFramebuffer.texture,
				normalMap0: wave_.components_.WaveGenerator.cascades[0].normalFramebuffer.texture,
				normalMap1: wave_.components_.WaveGenerator.cascades[1].normalFramebuffer.texture,
				normalMap2: wave_.components_.WaveGenerator.cascades[2].normalFramebuffer.texture,
				grdSiz: wave_.components_.WaveGenerator.GrdSiz,
				grdRes: wave_.components_.WaveGenerator.Res,
     	})
     );
		this.entityManager_.Add(ocean_, 'ocean');		
			
		//**********************************************************************************
		//**********************************************************************************



		const geometry = new THREE.BoxGeometry( 100, 100, 100 ); 
		const material = new THREE.MeshBasicMaterial( {color: 0xff0000} ); 
		this.cube = new THREE.Mesh( geometry, material ); 
		this.cube.position.set(0, 500, -10000);
		this.scene_.add( this.cube );



		//**********************************************************************************
		
		//textures
		this.butterfly = wave_.components_.WaveGenerator.butterflyFramebuffer.texture;
		//this.h0kSpectrumFramebuffer = wave_.components_.WaveGenerator.h0kSpectrumFramebuffer.texture;
		//this.h0SpectrumFramebuffer = wave_.components_.WaveGenerator.h0SpectrumFramebuffer.texture;
		//this.timeSpectrumFramebuffer = wave_.components_.WaveGenerator.spectrumFramebuffer.texture;
		this.displacementFramebuffer = wave_.components_.WaveGenerator.cascades[2].displacementFramebuffer.texture;
		//this.pingFramebuffer = wave_.components_.WaveGenerator.pingFramebuffer.texture;
		//this.pongFramebuffer = wave_.components_.WaveGenerator.pongFramebuffer.texture;

		

		//Test for frameBuffer textures because the composer needs a material
		var utest = {
			time: {value: this.clock_.getElapsedTime()},
			test: {value: this.displacementFramebuffer},		//texture: here i can check each texture

		}

		this.test = new THREE.RawShaderMaterial({
			glslVersion: THREE.GLSL3,
			uniforms: utest,
			vertexShader: commonVS,
			fragmentShader: testFS,
			depthTest: false,
		});


		
	//	this.composer_.addPass(new ShaderPass(this.test));

		//**********************************************************************************



		var light = new THREE.AmbientLight(0xffffff, 1); 
		this.scene_.add(light);

	}
	

	MoveCameraToOrigin() {

		const currentCameraPosition = this.camera_.position.clone();
		this.scene_.position.sub(currentCameraPosition);
		this.camera_.position.set(0, 0, 0);
	}



	RAF() {
	
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      } else {
        this.Step(t - this.previousRAF);


			const cameraPosition = new THREE.Vector3();// = this.params_.camera.position.clone();
			//const scenePosition = new THREE.Vector3();
			this.camera_.getWorldPosition(cameraPosition);
			//this.params_.scene.getWorldPosition(scenePosition);

			document.getElementById("testfield13").value = cameraPosition.x;
			document.getElementById("testfield14").value = cameraPosition.y;
			document.getElementById("testfield15").value = cameraPosition.z;

			const cameraDistance = this.camera_.position.length(); 
			
			document.getElementById("testfield16").value = cameraDistance;
			
			if (cameraDistance >= 2000) { 
				this.MoveCameraToOrigin(); 
			}
        
        this.threejs_.Render();
        this.previousRAF = t;
      }

      setTimeout(() => {
        this.RAF();
      }, 1);
    });
  }
  
  
  Step(timeElapsed) { 
    const timeElapsedS = Math.min(1.0 / 60.0, timeElapsed * 0.001);
    this.player.Update(timeElapsedS);//hack, just a fast implementation
    this.entityManager_.Update(timeElapsedS, 0);
  }

}


export {Main}