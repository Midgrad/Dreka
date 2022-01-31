class Ruler {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;
        this.input = input;

        // Callbacks
        input.subscribe(InputTypes.ON_CLICK, (event, cartesian, modifier) => {
            return that.onClick(event, cartesian, modifier);
        });

        // Data
        this.distance = 0;
        this.enabled = false;

        // Visual
        this.lineWidth = 3.0;

        // Entities
        var that = this;
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
        var newPoint = new TerrainPoint(this.viewer, this.input, position, Cesium.Color.CADETBLUE);
        newPoint.updateCallback = () => { that.updateDistance(); }
        newPoint.deleteCallback = () => { that.removePosition(that.points.indexOf(newPoint)); }
        newPoint.enabled = this.enabled;
        newPoint.hovered = this.enabled;
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

    onClick(event, cartesian, modifier) {
        if (Cesium.defined(modifier) || !this.enabled)
            return false;

        // Don't add point if hover two last points
        var length = this.points.length;
        if (length > 0 && this.points[length - 1].hovered)
            return true;
        if (length > 1 && this.points[length - 2].hovered)
            return true;

        this.addPosition(cartesian);
        return true;
    }
}