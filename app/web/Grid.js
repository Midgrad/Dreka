class Grid {
    constructor(cesium, gridController) {

        this.gridMaterial = Cesium.Material.fromType('Grid');
        this.gridMaterial.uniforms.color = Cesium.Color.WHITE.withAlpha(0.75);
        this.gridMaterial.uniforms.lineCount = new Cesium.Cartesian2(12, 9);

        this.deafultMaterial = cesium.viewer.scene.globe.material;

        var that = this;

        gridController.enabledChanged.connect(function() {
            cesium.viewer.scene.globe.material = gridController.enabled ?
                        that.gridMaterial : that.deafultMaterial;
        });
    }
}
