import {THREE} from '../three-defs.js';
import {entity} from '../entity.js';
import {ocean_constants} from './ocean-constants.js';
import {ocean_builder_threaded} from './ocean-builder-threaded.js';
import {quadtree} from './quadtree.js';
import {utils} from './utils.js';

//modular shaders
import { headerVS } from "../../resources/shader/headerVS.js";
import { headerFS } from "../../resources/shader/headerFS.js";
import { oceanVS } from "../../resources/shader/oceanVS.js";
import { oceanFS } from "../../resources/shader/oceanFS.js";



export const ocean = (() => {


	class OceanChunkManager extends entity.Component {
		constructor(params) {
			super();    	
			this.Init(params);
		}

		Init(params) {
			this.params_ = params;
			this.builder_ = new ocean_builder_threaded.OceanChunkRebuilder_Threaded();

			this.LoadTextures(params);
			this.InitOcean(params);
		}
     
		//****************************Material*****************************
		LoadTextures(params) {

			const loader = new THREE.TextureLoader();
			const noiseTexture = loader.load('./resources/textures/simplex-noise.png');
			const testTexture = loader.load('./resources/textures/ocean/test.jpg');


			var uniform = {
				vertexTexture: {value: null},
				normalTexture: {value: null},
				noiseTexture: {value: noiseTexture},
				sunPosition: {value: params.sunpos},
				cameraPosition: {value: null},
				color: {value: new THREE.Vector3(20/255, 50/255, 120/255)},
				time: {value: 0}, 			
	 			width: {value: 0},
	 			lod: {value: null},
	 			resolution: {value: 0},
	 			offset: {value: new THREE.Vector3()},
	 			wMatrix: {value: new THREE.Matrix4()},
	 			//neighbours: {value: new THREE.Vector4()},
	 			displacementMap0: {value: params.displacementMap0},
	 			displacementMap1: {value: params.displacementMap1},
	 			displacementMap2: {value: params.displacementMap2},
	 			normalMap0: {value: params.normalMap0},
	 			normalMap1: {value: params.normalMap1},
	 			normalMap2: {value: params.normalMap2},
	 			grdres: {value: params.grdRes},
				grdsiz: {value: params.GrdSiz},
				oceanSize: {value: ocean_constants.OCEAN_SIZE},
				minRadius: {value: ocean_constants.QT_OCEAN_MIN_LOD_RADIUS},
				numLayers: {value: ocean_constants.QT_OCEAN_LOD_NUM_LAYERS},
				gridResolution: {value: ocean_constants.QT_OCEAN_MIN_CELL_RESOLUTION},
			}


			this.material_ = new THREE.RawShaderMaterial({
				glslVersion: THREE.GLSL3,
				uniforms: uniform,
				vertexShader:  
					headerVS + '\n' +
					oceanVS,
				fragmentShader:
					headerFS + '\n' +
					oceanFS,
				side: THREE.DoubleSide,
				wireframe: params.wireframe,
			});
      
    }
		//****************************************************************


		InitOcean(params) {
			this.group = new THREE.Group();
			params.scene.add(this.group);
			this.chunks_ = {};
		}


		CreateOceanChunk(group, groupTransform, offset, width, resolution, lod) {
			const params = {
				group: group,
				transform: groupTransform,
				material: this.material_.clone(),
				width: width,
				offset: offset,
				resolution: resolution,
				lod: lod,
			};

			return this.builder_.AllocateChunk(params);
		}


		Update(_) {
			const cameraPosition = new THREE.Vector3();
			const scenePosition = new THREE.Vector3();
			this.params_.camera.getWorldPosition(cameraPosition);
			this.params_.scene.getWorldPosition(scenePosition);

			const tempCameraPosition = cameraPosition.clone();
			const relativePosition = tempCameraPosition.sub(scenePosition); 

			document.getElementById("testfield7").value = cameraPosition.x;
			document.getElementById("testfield8").value = cameraPosition.y;
			document.getElementById("testfield9").value = cameraPosition.z;

        document.getElementById("testfield19").value = relativePosition.x;
			document.getElementById("testfield20").value = relativePosition.y;
			document.getElementById("testfield21").value = relativePosition.z;


			this.builder_.Update();
      	if (!this.builder_.Busy) {
				for (let k in this.chunks_) {
          	this.chunks_[k].chunk.Show();
        	}
        	this.UpdateVisibleChunks_Quadtree_(cameraPosition, scenePosition, relativePosition);       
      	}

      	for (let k in this.chunks_) {
       // 	this.chunks_[k].chunk.mesh_.material.uniforms.cameraPosition.value = cameraPosition;
        	this.chunks_[k].chunk.mesh_.material.uniforms.cameraPosition.value = relativePosition;
        	this.chunks_[k].chunk.mesh_.material.uniforms.displacementMap0.value = this.params_.displacementMap0;
        	this.chunks_[k].chunk.mesh_.material.uniforms.displacementMap1.value = this.params_.displacementMap1;
        	this.chunks_[k].chunk.mesh_.material.uniforms.displacementMap2.value = this.params_.displacementMap2;
        	this.chunks_[k].chunk.mesh_.material.uniforms.normalMap0.value = this.params_.normalMap0;
        	this.chunks_[k].chunk.mesh_.material.uniforms.normalMap1.value = this.params_.normalMap1;
        	this.chunks_[k].chunk.mesh_.material.uniforms.normalMap2.value = this.params_.normalMap2;
        	this.chunks_[k].chunk.mesh_.material.uniforms.time.value = this.params_.clock.getElapsedTime();
        	this.chunks_[k].chunk.mesh_.material.uniformsNeedUpdate = true;
      	}
      	for (let c of this.builder_.old_) {
        	c.chunk.Update(cameraPosition);
      	}
		}//end Update


		UpdateVisibleChunks_Quadtree_(cameraPosition, scenePosition, relativePosition) {      
        
			function _Key(c) {
				return c.position[0] + '/' + c.position[1] + ' [' + c.size + ']';
			}

			const q = new quadtree.Root({
				size: ocean_constants.OCEAN_SIZE,
				min_lod_radius: ocean_constants.QT_OCEAN_MIN_LOD_RADIUS,
				lod_layers: ocean_constants.QT_OCEAN_LOD_NUM_LAYERS,
				min_node_size: ocean_constants.QT_OCEAN_MIN_CELL_SIZE,
			});


			q.Insert(relativePosition);
			//q.Insert(cameraPosition );


			const sides = q.GetChildren();
			
			let newOceanChunks = {};
			const center = new THREE.Vector3();
			const dimensions = new THREE.Vector3();

			const _Child = (c) => {
				c.bounds.getCenter(center);
				c.bounds.getSize(dimensions);

				const child = {
					group: this.group,
					transform: sides.transform,
					position: [center.x, center.y, center.z],
					bounds: c.bounds,
					size: dimensions.x,
					lod: c.lod,
				};
				return child;
			};


				for (let c of sides.children) {
					const child = _Child(c);
					const k = _Key(child);

					newOceanChunks[k] = child;				
				}


			const allChunks = newOceanChunks;
			const intersection = utils.DictIntersection(this.chunks_, newOceanChunks);
			const difference = utils.DictDifference(newOceanChunks, this.chunks_);
			const recycle = Object.values(utils.DictDifference(this.chunks_, newOceanChunks));

			const allChunksLeft = utils.DictIntersection(newOceanChunks, recycle);

			if (0) {
				const partialRebuilds = {};

				for (let k in partialRebuilds) {
					if (k in intersection) {
						recycle.push(this.chunks_[k]);
						delete intersection[k];
						difference[k] = allChunks[k];
					}
				}
			}

			this.builder_.RetireChunks(recycle);

			newOceanChunks = intersection;
			

			for (let k in difference) {
				const [xp, yp, zp] = difference[k].position;

				const offset = new THREE.Vector3(xp, yp, zp);
				
				newOceanChunks[k] = {
					position: [xp, zp],
					chunk: this.CreateOceanChunk(
						difference[k].group, difference[k].transform,
						offset, difference[k].size,
						ocean_constants.QT_OCEAN_MIN_CELL_RESOLUTION,
						difference[k].lod
					),
				};
			}

			this.chunks_ = newOceanChunks;
		}
 
	}//end class



return {
	OceanChunkManager: OceanChunkManager,
}

})();