class Area {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Interaction} interaction
     */
    constructor(viewer, interaction) {
        this.viewer = viewer;
        this.interaction = interaction;

        // Callbacks
        var that = this;
        interaction.subscribeEmptyClick(cartesian => { return that.onClick(cartesian); });
        this.changedCallback = null;

        // Visual
        this.lineWidth = 2.0;

        // Data
        this.enabled = false;

        // Entities
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
    addPosition(position) {
        var that = this;
        var newPoint = new TerrainPoint(this.viewer, this.interaction, position, Cesium.Color.WHITE);
        if (that.changedCallback)
            newPoint.updateCallback = () => { that.changedCallback(); }
        newPoint.deleteCallback = () => { that.removePosition(that.points.indexOf(newPoint)); }
        newPoint.enabled = this.enabled;
        this.points.push(newPoint);
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
            this.addPosition(cartesian);
        });

        this.sort();

        if (this.changedCallback)
            this.changedCallback();
    }

    sort() {
        if (this.points.length < 3)
            return;

        var points = this.points.filter(() => true);
        var findClosest = (position) => {
            var minDistance = Number.MAX_SAFE_INTEGER;
            var minI = -1;
            for (var i = 0; i < points.length; ++i) {
                var distance = Cesium.Cartesian3.distanceSquared(points[i].position, position);
                if (distance < minDistance) {
                    minDistance = distance;
                    minI = i;
                }
            }
            return minI;
        }

        var last = points.splice(0, 1)[0];
        var sorted = [last];
        while (points.length) {
            var i = findClosest(last.position);
            if (i === -1)
                break;

            last = points.splice(i, 1)[0];
            sorted.push(last);
        }

        this.points = sorted;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.clear();
    }

    onClick(cartesian) {
        if (!this.enabled)
            return false;

        this.addPosition(cartesian);
        this.sort();

        if (this.changedCallback)
            this.changedCallback();

        return true;
    }
}
