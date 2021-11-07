class RulerPoint extends DraggablePoint {
    /**
     * @param {Cesium.Viewr} viewer
     * @param {Cesium.Cartesian} position
     */
    constructor(viewer, position) {
        super(viewer);

        // Data
        this.position = position;

        // DraggablePoint point
        var that = this;
        this.point = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position }, false),
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE
            }
        });
    }

    clear() {
        this.viewer.entities.remove(this.point);
    }

    setHovered(hovered) {
        this.point.point.pixelSize = hovered ? this.hoveredPointPixelSize : this.pointPixelSize;
    }

    checkMatch(objects) {
        var result = null;
        objects.forEach(object => {
            if (this.point === object.id)
                 result = this.point;
        });
        return result;
    }
}

class Ruler extends Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        super(viewer, input);

        // Data
        this.distance = 0;
        this.enabled = false;

        // Visual
        this.lineWidth = 3.0;

        // Entities
        this.points = [];

        // Labels between points
        this.labels = [];

        // Polyline to connect points
        var that = this;
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

    /**
     * @param {Cesium.Cartesian} position
     */
    addPoint(position) {
        var lastPoint = this.points.slice(-1).pop();
        var newPoint = new RulerPoint(this.viewer, position);
        this.points.push(newPoint);

        if (lastPoint)
            this.addLabel(lastPoint, newPoint);

        this.setHoveredPoint(newPoint);

        // Update ruler distance
        if (lastPoint && this.distanceCallback) {
            this.distance += Cesium.Cartesian3.distance(lastPoint.position, position);
            this.distanceCallback(this.distance);
        }
    }

    addLabel(first, second) {
        this.labels.push(this.viewer.entities.add({
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
        }));
    }

    clear() {
        // super.clear();

        for (var i = 0; i < this.labels.length; ++i) {
            this.viewer.entities.remove(this.labels[i]);
        }
        this.labels = [];

        this.distance = 0;

        this.points.forEach(point => point.clear());
        this.points = [];
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
    }

    onClick(cartesian, x, y, objects) {
        if (objects.length === 0 && Cesium.defined(cartesian) && !this.hoveredPoint) {
            this.addPoint(cartesian);
            return true;
        }
        return false;
    }

    onPick(pickedObjects) {
        if (super.onPick(pickedObjects))
            return true;

        // Try to pick new point
        this.points.forEach(candidate => {
            if (candidate.checkMatch(pickedObjects))
                this.setHoveredPoint(candidate);
        });
    }

    onMove(cartesian) {
        if (this.hoveredPoint && this.hoveredPoint.dragging) {
            this.hoveredPoint.position = cartesian;
            this.updateDistance();
        }
    }
}
