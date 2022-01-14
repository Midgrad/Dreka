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
//                hierarchy: new Cesium.CallbackProperty(() => {
//                    return Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(that.positions);
//                }, false),
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

        this.points.forEach(point => this.viewer.entities.remove(point));
        this.points = [];

        this.positions = [];
    }

    setPositions(positions) {
        this.points.forEach(point => this.viewer.entities.remove(point));
        this.points = [];

        this.positions = [];

        var that = this;
        var textIndex = 1;
        positions.forEach(position => {
            var cartesian = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude,
                                                          position.altitude);
            that.positions.push(cartesian);

            var point = this.viewer.entities.add({
                position: cartesian,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.WHITE
                },
                label: {
                    text: (textIndex++).toString(),
                    showBackground: true,
                    pixelOffset: new Cesium.Cartesian2(0, -25),
                    font: "13px Helvetica",
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
            this.points.push(point);
        });

        this.polygon.polygon.hierarchy = this.positions;
    }
}
