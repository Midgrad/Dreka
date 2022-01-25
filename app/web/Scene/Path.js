class Path {
    /**
     * @param {Cesium.Viewr} viewer
     */
    constructor(viewer, pathColor = Cesium.Color.WHITE) {
        this.viewer = viewer;

        // Visual
        this.lineWidth = 3.0;

        // Data
        this.positions = [];

        // Entities
        var that = this;
        this.lines = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => { return that.positions; }, false),
                arcType: Cesium.ArcType.GEODESIC,
                width: this.lineWidth,
                material: pathColor
            }
        });
    }

    /**
     * @param {Cesium.Cartesian} position
     */
    addPosition(position) { this.positions.push(position); }

    setPositions(positions) {
        this.positions = [];

        positions.forEach(position => {
            var cartesian = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude,
                                                          position.altitude);
            this.addPosition(cartesian);
        });
    }
}
