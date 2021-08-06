class Ruler {
    constructor(cesium, rulerController) {

        this.viewer = cesium.viewer;
        this.rulerController = rulerController;

        this.pointPixelSize = 8.0;
        this.hoveredPointPixelSize = 16.0;
        this.lineWidth = 4.0;

        this.points = [];
        this.lines = [];
        this.positions = [];
        this.hoveredPoint = null;
        this.dragging = false;

        var that = this;

        // clear signal
        rulerController.clear.connect(function() { that.clear(); });
    }

    addNewPoint(cartesian) {
        var lastPosition = this.positions.slice(-1).pop();
        if (lastPosition)
            this.addLine(lastPosition, cartesian);

        var point = this.viewer.entities.add({
            position: cartesian,
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
        });
        this.points.push(point);
        this.makeHoveredPoint(point);

        // Not empty now
        this.rulerController.empty = false;

        // Update ruler distance
        if (lastPosition)
            this.rulerController.distance += Cesium.Cartesian3.distance(lastPosition, cartesian);
        this.positions.push(cartesian);
    }

    addLine(first, second) {
        this.lines.push(this.viewer.entities.add({
            position: this.intermediate(first, second),
            polyline: {
                positions: [first, second],
                arcType: Cesium.ArcType.GEODESIC,
                width : this.lineWidth,
                material : Cesium.Color.CADETBLUE,
                depthFailMaterial: Cesium.Color.CADETBLUE
            },
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
        for (var i = 0; i < this.points.length; ++i) {
            this.viewer.entities.remove(this.points[i]);
        }
        this.points = [];

        for (i = 0; i < this.lines.length; ++i) {
            this.viewer.entities.remove(this.lines[i]);
        }
        this.lines = [];
        this.positions = [];

        this.rulerController.empty = true;
        this.rulerController.distance = 0;
    }

    intermediate(first, second) {
        var scratch = new Cesium.Cartesian3();

        var difference = Cesium.Cartesian3.subtract(first, second, scratch);
        var distance = -0.5 * Cesium.Cartesian3.magnitude(difference);
        var direction = Cesium.Cartesian3.normalize(difference, scratch);

        return Cesium.Cartesian3.add(first, Cesium.Cartesian3.multiplyByScalar(
                                            direction, distance, scratch), scratch);
    }

    makeHoveredPoint(point) {
        point.point.pixelSize = this.hoveredPointPixelSize;
        this.hoveredPoint = point;
    }

    dropHoveredPoint() {
        if (!this.hoveredPoint)
            return;

        this.hoveredPoint.point.pixelSize = this.pointPixelSize;
        this.hoveredPoint = null;
    }

    setDragging(dragging) {
        this.dragging = dragging;

        var scene = this.viewer.scene;
        scene.screenSpaceCameraController.enableRotate = !dragging;
        scene.screenSpaceCameraController.enableTranslate = !dragging;
        scene.screenSpaceCameraController.enableZoom = !dragging;
        scene.screenSpaceCameraController.enableTilt = !dragging;
        scene.screenSpaceCameraController.enableLook = !dragging;
    }

    rebuildLinesAndReturnLength() {
        for (var i = 0; i < this.lines.length; ++i) {
            this.viewer.entities.remove(this.lines[i]);
        }
        this.lines = [];

        var distance = 0.0;
        for (i = 1; i < this.positions.length; ++i) {
            var last = this.positions[i - 1];
            var current = this.positions[i];
            distance += Cesium.Cartesian3.distance(last, current);
            this.addLine(last, current);
        }
        return distance;
    }

    onClick(cartesian) {
        if (this.rulerController.rulerMode && Cesium.defined(cartesian))
            this.addNewPoint(cartesian);
    }

    onDown(cartesian) {
        if (this.hoveredPoint)
            this.setDragging(true);
    }

    onUp(cartesian) {
        this.setDragging(false);
    }

    onMove(cartesian) {
        if (!this.dragging || !Cesium.defined(cartesian) || !this.hoveredPoint) return;

        this.hoveredPoint.position = cartesian;
        var index = this.points.indexOf(this.hoveredPoint);
        this.positions[index] = cartesian;
        this.rulerController.distance = this.rebuildLinesAndReturnLength();
    }

    onPick(pickedObject) {
        if (this.dragging)
            return;

        if (!Cesium.defined(pickedObject)) {
            this.dropHoveredPoint();
            return;
        }

        var entity = pickedObject.id;
        if (entity === this.hoveredPoint)
            return;

        this.dropHoveredPoint();

        if (this.points.includes(entity))
            this.makeHoveredPoint(entity);
    }
}
