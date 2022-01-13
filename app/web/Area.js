class Area {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;
        this.input = input;

        // Callbacks
        this.pointChangedCallback = null;

        // Data
        this.positions = [];
        this.editMode = false;

        // Entities
        this.points = [];
        var that = this;
        this.polygon = viewer.entities.add({
            polygon: {
                outline: true,
                outlineWidth: 4,
                outlineColor: Cesium.Color.WHITE,
                material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.3)),
                perPositionHeight: true,
                arcType: Cesium.ArcType.GEODESIC
            },
        });
    }

    clear() {
        that.viewer.entities.remove(this.polygon);
        this.polygon = null;

        this.points.forEach(point => point.clear());
        this.points = [];

        this.positions = [];
    }

    addPosition(cartographic) {
        this.positions.push(cartographic);
        if (this.positions.length > 2)
            this.polygon.polygon.hierarchy =
                Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(this.positions);
    }
}
