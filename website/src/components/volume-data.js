AFRAME.registerComponent("volume-render", {
  schema: {
    step: { default: 100 },
    fps: { default: 30 },
    playing: { default: false },
    sampling_rate: { default: 1.0 },
    star_color: { default: "#666666" },
    star_radius: { default: 0.055 },
    vol_dims: { default: { x: 120, y: 120, z: 120 } }
  },
  init: function() {
    this.start = 0;
    this.end = 0;
    this.timeElapsed = 0.0;
    this.next_step = this.next_step.bind(this);
    this.prev_step = this.prev_step.bind(this);
    this.vs = document.querySelector("#vs").data;
    this.fs = document.querySelector("#fs").data;
    this.transTex = new THREE.Texture(document.querySelector("#transfer"));
    this.transTex.needsUpdate = true;
    this.texNeedsUpdate = false;
    this.txt = null;

    console.log(this.transTex);
    var self = this;
    var el = this.el;

    el.addEventListener("loadfinished", function(evt) {
      // Load all timesteps at once, and set everything else to invisible
      self.data.step = evt.detail.start;
      self.start = evt.detail.start;
      self.end = evt.detail.end;
      // console.log(evt.detail);
      // for (var i = self.start; i <= self.end; i++) {
      // }

      // Get camera position
      var cameraEl = document.querySelector("[camera]");
      var pos = new THREE.Vector3();
      cameraEl.object3D.getWorldPosition(pos);
      console.log(pos);
      el.object3D.worldToLocal(pos);

      // self.mat = new THREE.RawShaderMaterial({
      self.mat = new THREE.ShaderMaterial({
        uniforms: {
          eye_pos: new THREE.Uniform(pos),
          volume_scale: new THREE.Uniform(new THREE.Vector3(1.0, 1.0, 1.0)),
          cubeTex: { type: "t", value: self.txt },
          transferTex: { type: "t", value: self.transTex },
          alphaCorrection: { type: "f", value: 1.0 },
          dt_scale: { type: "f", value: self.data.sampling_rate },
          volume_dims: new THREE.Uniform(
            new Int32Array([
              self.data.vol_dims.x,
              self.data.vol_dims.y,
              self.data.vol_dims.z
            ])
          ),
          starColor: {
            type: "c",
            value: new THREE.Color(self.data.star_color)
          },
          star_radius: { value: self.data.star_radius }
          // species: { type: "i", value: menu.species }
        },
        vertexShader: self.vs,
        fragmentShader: self.fs,
        side: THREE.BackSide,
        transparent: true
      });
      console.log(self.mat);

      var cube_geometry = new THREE.BoxGeometry(1, 1, 1);
      var box = new THREE.Mesh(cube_geometry, self.mat);
      el.setObject3D("box", box);

      self.load_step(self.data.step);
    });

    el.addEventListener("nextstep", this.next_step);

    el.addEventListener("prevstep", this.prev_step);
  },

  tick: function(time, timeDelta) {
    if (this.texNeedsUpdate) {
      // console.log("Updating texture!", this.transTex);
      this.mat.uniforms.cubeTex.value = this.txt;
      this.texNeedsUpdate = false;
    }

    // Update camera position
    var pos = new THREE.Vector3();
    var cameraEl = this.el.sceneEl.camera.el;
    cameraEl.object3D.getWorldPosition(pos);
    this.el.object3D.worldToLocal(pos);
    this.mat.uniforms.eye_pos.value = pos;
  },

  next_step: function() {},

  prev_step: function() {},

  load_step: function(step) {
    var file = document.querySelector("#timestep" + step);
    var self = this;
    console.log(file);
    if (file.hasLoaded) {
      this.apply_volume_data(file.data, step);
    } else {
      file.addEventListener("loaded", function() {
        self.apply_volume_data(file.data, step);
      });
    }
  },

  apply_volume_data: function(content, step) {
    var data = new Uint8Array(content);
    var texture = new THREE.DataTexture3D(
      data,
      this.data.vol_dims.x,
      this.data.vol_dims.y,
      this.data.vol_dims.z
    );
    // texture.format = THREE.RGBAFormat;
    texture.format = THREE.RedFormat;
    texture.type = THREE.UnsignedByteType;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    texture.unpackAlignment = 1;
    this.txt = texture;
    this.texNeedsUpdate = true;
    // console.log(texture);
  },

  apply_transfer_texture: function(src) {}
});
