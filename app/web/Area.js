class Area {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;
        this.input = input;

        // Callbacks
        this.changedCallback = null;
        input.subscribe(InputTypes.ON_CLICK, (event, cartesian, modifier) => {
            return that.onClick(event, cartesian, modifier);
        });

        // Visual
        this.lineWidth = 3.0;

        // Data
        this.enabled = false;

        // Entities
        var that = this;
        this.points = [];
        this.polygon = viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.CallbackProperty(() => {
                    var positions = [];
                    that.points.forEach(point => { positions.push(point.position); });
                    return new Cesium.PolygonHierarchy(positions);
                }, false),
                outline: true,
                outlineWidth: this.lineWidth,
                outlineColor: Cesium.Color.WHITE,
                material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.3)),
                perPositionHeight: true,
                arcType: Cesium.ArcType.GEODESIC
            },
        });
    }

    clear() {
        this.points.forEach(point => point.clear());
        this.points = [];
    }

    /**
     * @param {Cesium.Cartesian} position
     */
    addPoint(position) {
        var that = this;
        var newPoint = new TerrainPoint(this.viewer, this.input, position, Cesium.Color.WHITE);
        if (that.changedCallback)
            newPoint.updateCallback = () => { that.changedCallback(); }
        newPoint.enabled = this.enabled;
        this.points.push(newPoint);

        if (this.changedCallback)
            this.changedCallback();
    }

    setPositions(positions) {
        this.clear();
        positions.forEach(position => {
            var cartesian = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude,
                                                          position.altitude);
            this.addPoint(cartesian);
        });

        if (this.changedCallback)
            this.changedCallback();
    }

    setEnabled(enabled) {
        this.enabled = enabled;

        this.clear();
    }

    onClick(event, cartesian, modifier) {
        if (Cesium.defined(modifier) || !this.enabled)
            return false;

        // Don't add point if hover any point
        for (var i = 0; i < this.points.length; ++i) {
            if (this.points[i].hovered)
                return true;
        }

        this.addPoint(cartesian);
        return true;
    }
}
