class Ruler {
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

        // Data
        this.distance = 0;
        this.enabled = false;

        // Visual
        this.lineWidth = 3.0;

        // Entities
        this.points = [];
        this.labels = [];
        this.lines = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    var positions = [];
                    that.points.forEach(point => { positions.push(point.position); });
                    return positions;
                }, false),
                arcType: Cesium.ArcType.GEODESIC,
                width: this.lineWidth,
                material: Cesium.Color.CADETBLUE
            }
        });
    }

    clear() {
        for (var i = 0; i < this.labels.length; ++i) {
            this.viewer.entities.remove(this.labels[i]);
        }
        this.labels = [];

        this.distance = 0;

        this.points.forEach(point => point.clear());
        this.points = [];
    }

    /**
     * @param {Cesium.Cartesian} position
     */
    addPosition(position) {
        var that = this;
        var lastPoint = this.points.slice(-1).pop();
        var newPoint = new TerrainPoint(this.viewer, this.interaction, position, Cesium.Color.CADETBLUE);
        newPoint.updateCallback = () => { that.updateDistance(); }
        newPoint.deleteCallback = () => { that.removePosition(that.points.indexOf(newPoint)); }
        newPoint.enabled = this.enabled;
        this.points.push(newPoint);

        if (lastPoint)
            this.addLabel(lastPoint, newPoint);

        // Update ruler distance
        if (lastPoint && this.distanceCallback) {
            this.distance += Cesium.Cartesian3.distance(lastPoint.position, position);
            this.distanceCallback(this.distance);
        }
    }

    removePosition(index) {
        if (index < 0 || index >= this.points.length)
            return;

        var hasRightBuddy = index + 1 < this.points.length;
        var hasLeftBuddy = index > 0;

        if (hasRightBuddy)
            this.removeLabel(index);
        if (hasLeftBuddy)
            this.removeLabel(index - 1);

        this.points[index].clear();
        this.points.splice(index, 1);

        if (hasRightBuddy && hasLeftBuddy)
            this.addLabel(this.points[index - 1], this.points[index], index - 1);

        if (this.changedCallback)
            this.changedCallback();
    }

    addLabel(first, second, index = -1) {
        var label = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
                return intermediate(first.position, second.position);
            }, false),
            label: {
                text: new Cesium.CallbackProperty(() => {
                    return Math.round(Cesium.Cartesian3.distance(first.position, second.position))
                                                      + " m";
                }, false),
                showBackground: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica"
            }
        });

        if (index === -1)
            this.labels.push(label);
        else
            this.labels.splice(index, 0, label);
    }

    removeLabel(index) {
        this.viewer.entities.remove(this.labels[index]);
        this.labels.splice(index, 1);
    }

    updateDistance() {
        this.distance = 0.0;

        for (var i = 1; i < this.points.length; ++i) {
            this.distance += Cesium.Cartesian3.distance(this.points[i - 1].position,
                                                        this.points[i].position);
        }

        if (this.distanceCallback) {
            this.distanceCallback(this.distance);
        }
    }

    subscribeDistance(callback) {
        this.distanceCallback = callback;
    }

    setEnabled(enabled) {
        this.enabled = enabled;

        if (this.points.length === 1)
            this.clear();
        else
            this.points.forEach(point => { point.enabled = enabled; });
    }

    onClick(cartesian) {
        if (!this.enabled)
            return false;

        this.addPosition(cartesian);
        return true;
    }
}
