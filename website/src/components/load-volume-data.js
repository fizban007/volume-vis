AFRAME.registerComponent("load-volume-data", {
  schema: {
    filename: { default: "./data/volume.dat" }
  },

  init: function() {
    var assets = document.getElementsByTagName("a-assets")[0];
    var volume_asset = document.createElement("a-asset-item");
    volume_asset.setAttribute("id", 0);
    volume_asset.setAttribute("src", this.data.filename);
    volume_asset.setAttribute("response-type", "arraybuffer");
    assets.appendChild(volume_asset);

    // Find the volume render DOM element and let it know load is finished
    var vol = document.getElementById("volume-render");
    vol.emit("loadfinished", { start: 0, end: 0 }, false);
  }
});
