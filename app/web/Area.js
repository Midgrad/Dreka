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
        this.lineWidth = 2.0;

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
                material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.2)),
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
    addPosition(position, hovered) {
        var that = this;
        var newPoint = new TerrainPoint(this.viewer, this.input, position, Cesium.Color.WHITE);
        if (that.changedCallback)
            newPoint.updateCallback = () => { that.changedCallback(); }
        newPoint.deleteCallback = () => { that.removePosition(that.points.indexOf(newPoint)); }
        newPoint.enabled = this.enabled;
        newPoint.hovered = hovered;

        var len = this.points.length;
        if (len < 2)
            this.points.push(newPoint);
        else {
            var minDistance = Number.MAX_SAFE_INTEGER;
            var minI = -1;
            for (var i = 0; i < len; ++i) {
                var distance = Cesium.Cartesian3.distanceSquared(this.points[i].position, position);
                if (distance < minDistance) {
                    minDistance = distance;
                    minI = i;
                }
            }
            this.points.splice(minI, 0, newPoint);
        }

        if (this.changedCallback)
            this.changedCallback();
    }

    removePosition(index) {
        if (index < 0 || index >= this.points.length)
            return;

        this.points[index].clear();
        this.points.splice(index, 1);

        if (this.changedCallback)
            this.changedCallback();
    }

    setPositions(positions) {
        this.clear();
        positions.forEach(position => {
            var cartesian = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude,
                                                          position.altitude);
            this.addPosition(cartesian, false);
        });
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

        this.addPosition(cartesian, true);
        return true;
    }
}
