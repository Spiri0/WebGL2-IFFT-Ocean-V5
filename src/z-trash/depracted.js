/*		
			// 4. Displacement Map (iterations = 9*2
			let iterations = Math.log2(this.Res)*2; // log2(512) = 9 *2 = 18
			this.screenQuad.material = this.materialOceanHorizontal;
			let subtransformProgram = this.materialOceanHorizontal;

			let pingPong = true;
			let frameBuffer, inputBuffer = 0;
			for (let i = 0; i < iterations-1; i++) {
				pingPong = !pingPong;
				if (i === 0) {
					inputBuffer = this.spectrumFramebuffer;
					frameBuffer = this.pingTransformFramebuffer;
				}
				else{
					inputBuffer = pingPong ? this.pingTransformFramebuffer : this.pongTransformFramebuffer;
					frameBuffer = pingPong ? this.pongTransformFramebuffer : this.pingTransformFramebuffer;		
				}
				if (i === iterations/2) {// switch to vertical at midway point
					subtransformProgram = this.materialOceanVertical;
					this.screenQuad.material = this.materialOceanVertical;
				}
				subtransformProgram.uniforms.u_input.value = inputBuffer.texture;
				subtransformProgram.uniforms.subtransformSize.value = Math.pow(2,(i%(iterations/2)+1));
				subtransformProgram.uniformsNeedUpdate = true;	
				params.renderer.setRenderTarget(frameBuffer);
				params.renderer.render(this.screenQuad, this.textureCamera);
				params.renderer.setRenderTarget(null);
			}
	*/