class Ruler extends Draggable {
    constructor(cesium, rulerController) {
        super(cesium.viewer);

        // Visual
        this.rulerController = rulerController;
        this.lineWidth = 3.0;

        // Cartesian coordinates
        this.positions = [];

        // Entities
        this.labels = [];

        var that = this;
        this.lines = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function() { return that.positions; }, false),
                arcType: Cesium.ArcType.GEODESIC,
                width: this.lineWidth,
                material: Cesium.Color.CADETBLUE
            }
        });

        // clear signal
        rulerController.clear.connect(function() { that.clear(); });
    }

    addPoint(cartesian) {
        var lastPosition = this.positions.slice(-1).pop();
        if (lastPosition)
            this.addLabel(lastPosition, cartesian);

        var point = this.viewer.entities.add({
            position: cartesian,
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE
            }
        });
        this.points.push(point);
        this.makeHoveredPoint(point);

        // Update ruler distance
        if (lastPosition)
            this.rulerController.distance += Cesium.Cartesian3.distance(lastPosition, cartesian);
        this.positions.push(cartesian);
    }

    addLabel(first, second) {
        this.labels.push(this.viewer.entities.add({
            position: this.intermediate(first, second),
            label: {
                text: Cesium.Cartesian3.distance(first, second).toFixed(2),
                showBackground: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica"
            }
        }));
    }

    clear() {
        super.clear();

        for (var i = 0; i < this.labels.length; ++i) {
            this.viewer.entities.remove(this.labels[i]);
        }
        this.labels = [];

        this.rulerController.distance = 0;
        this.positions = [];
    }

    intermediate(first, second) {
        var scratch = new Cesium.Cartesian3();

        var difference = Cesium.Cartesian3.subtract(first, second, scratch);
        var distance = -0.5 * Cesium.Cartesian3.magnitude(difference);
        var direction = Cesium.Cartesian3.normalize(difference, scratch);

        return Cesium.Cartesian3.add(first, Cesium.Cartesian3.multiplyByScalar(
                                            direction, distance, scratch), scratch);
    }

    rebuildLength() {
        var distance = 0.0;
        for (var i = 1; i < this.positions.length; ++i) {
            distance += Cesium.Cartesian3.distance(this.positions[i - 1], this.positions[i]);
        }
        return distance;
    }

    changeLabelsPositions(label, first, second) {
        label.position = this.intermediate(first, second);
        label.label.text = Cesium.Cartesian3.distance(first, second).toFixed(2);
    }

    onClick(cartesian) {
        if (this.rulerController.rulerMode && Cesium.defined(cartesian))
            this.addPoint(cartesian);
    }

    onMove(cartesian) {
        var index = super.onMove(cartesian);
        if (index === -1)
            return;

        // Move point to new place
        this.positions[index] = cartesian;

        // Rebuild labels
        if (index > 0)
            this.changeLabelsPositions(this.labels[index - 1], this.positions[index - 1], cartesian);
        if (index < this.labels.length)
            this.changeLabelsPositions(this.labels[index], cartesian, this.positions[index + 1]);

        this.rulerController.distance = this.rebuildLength();
    }
}
