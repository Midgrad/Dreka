class RulerPoint extends Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     * @param {Cesium.Cartesian} position
     */
    constructor(viewer, input, position) {
        super(viewer, input);

        var that = this;

        // Callbacks
        this.updateCallback = null;

        // Data
        this.position = position;
        this.enabled = false;
        this.hovered = true;

        // Visual
        this.pointPixelSize = 8.0;
        this.hoveredPointPixelSize = 16.0;

        // Draggable point
        this.point = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position }, false),
            point: {
                pixelSize: new Cesium.CallbackProperty(() => { return that.hovered ?
                                                               that.hoveredPointPixelSize :
                                                               that.pointPixelSize; }, false),
                color: Cesium.Color.CADETBLUE
            }
        });
    }

    clear() {
        this.viewer.entities.remove(this.point);
    }

    onUp(event, cartesian, modifier) {
        if (this.dragging) {
            this.setDragging(false);
            return true;
        }
        return false;
    }

    onDown(event, cartesian, modifier) {
        if (this.hovered) {
            this.setDragging(true);
            return true;
        }
        return false;
    }

    onMove(event, cartesian, modifier) {
        if (this.dragging && Cesium.defined(cartesian)) {
            this.position = cartesian;
            this.updateCallback();
            return true;
        }
        return false;
    }

    onPick(objects) {
        if (!this.enabled)
            return false;

        var result = null;
        objects.forEach(object => {
            if (this.point === object.id)
            result = this.point;
        });

        this.hovered = result;
        return result;
    }
}

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
        var that = this;
        var lastPoint = this.points.slice(-1).pop();
        var newPoint = new RulerPoint(this.viewer, this.input, position);
        newPoint.updateCallback = () => { that.updateDistance(); }
        newPoint.enabled = this.enabled;
        this.points.push(newPoint);

        if (lastPoint)
            this.addLabel(lastPoint, newPoint);

        // this.setHoveredPoint(newPoint);

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

        if (this.points.length === 1)
            this.clear();
        else
            this.points.forEach(point => { point.enabled = enabled; });
    }

    onClick(event, cartesian, modifier) {
        if (Cesium.defined(modifier) || !this.enabled)
            return false;

        // Don't add point if hover two last points
        var length = this.points.length
        if (length > 0 && this.points[length - 1].hovered)
            return true;
        if (length > 1 && this.points[length - 2].hovered)
            return true;

        this.addPoint(cartesian);
        return true;
    }
}
