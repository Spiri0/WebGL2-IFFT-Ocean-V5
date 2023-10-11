import {THREE} from '../three-defs.js';



export const ocean_chunk = (function() {

  class OceanChunk {
    constructor(params) {
      this.params_ = params;
      this.Init(params);
    }
    
    Destroy() {
      this.params_.group.remove(this.mesh_);
    }

    Hide() {
      this.mesh_.visible = false;
    }

    Show() {
      this.mesh_.visible = true;
    }

		Init(params) {
			this.geometry_ = new THREE.BufferGeometry();
			this.mesh_ = new THREE.Mesh(this.geometry_, params.material);
			this.mesh_.castShadow = false;
			this.mesh_.receiveShadow = true;
			// this.mesh_.frustumCulled = false;
 
			const localToWorld = params.transform;
			const boundingSphereCenter = new THREE.Vector3(params.offset.x, params.offset.y, params.offset.z);					
			boundingSphereCenter.applyMatrix4(localToWorld);
			const boundingSphere = new THREE.Sphere(boundingSphereCenter, params.width * 2);
			this.mesh_.geometry.boundingSphere = boundingSphere;
			this.mesh_.geometry.computeBoundingSphere();
 	
			this.params_.group.add(this.mesh_);
			this.Reinit(params);     
		}

    Update() {

    }

    Reinit(params) {
      this.params_ = params;
      this.mesh_.position.set(0, 0, 0);
    }

		SetWireframe(b) {
			this.mesh_.material.wireframe = b;
		}


		RebuildMeshFromData(data) {
			this.geometry_.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
			this.geometry_.setAttribute('vindex', new THREE.Int32BufferAttribute(data.vindices, 1));
			this.geometry_.setIndex(new THREE.BufferAttribute(data.indices, 1));
      
			this.geometry_.attributes.position.needsUpdate = true;
			this.geometry_.attributes.vindex.needsUpdate = true;

 
			this.mesh_.material.uniforms.wMatrix.value = data.worldMatrix;
			this.mesh_.material.uniforms.resolution.value = data.resolution;
			this.mesh_.material.uniforms.offset.value = data.offset;
			this.mesh_.material.uniforms.width.value = data.width;
			this.mesh_.material.uniforms.lod.value = this.params_.lod;
			this.mesh_.material.uniformsNeedUpdate = true;
 
		}

  }

  return {
    OceanChunk: OceanChunk
  }
})();
