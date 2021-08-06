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
        var scene = this.viewer.scene;

        // clear signal
        rulerController.clear.connect(function() { that.clear(); });

        // Left down to add ruler points and move existing points
        var downHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        downHandler.setInputAction(function(event) {
            // Ignore with no ruler mode
            if (!rulerController.rulerMode)
                return;

            if (that.hoveredPoint) {
                that.setDragging(true);
                return;
            }

            // PickPosition is currently only supported in 3D mode
            if (!scene.pickPositionSupported ||
                    scene.mode !== Cesium.SceneMode.SCENE3D)
                return;

            var cartesian = that.viewer.scene.pickPosition(event.position);
            if (Cesium.defined(cartesian))
                that.addNewPoint(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        var upHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        upHandler.setInputAction(function(event) {
            that.setDragging(false);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // pick hovered points
        var moveHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
            moveHandler.setInputAction(function (movement) {

                if (that.dragging) {
                    var cartesian = that.viewer.scene.pickPosition(movement.endPosition);
                    if (Cesium.defined(cartesian)) {
                        that.hoveredPoint.position = cartesian;
                        var index = that.points.indexOf(that.hoveredPoint);
                        that.positions[index] = cartesian;
                        rulerController.distance = that.rebuildLinesAndReturnLength();
                    }
                    return;
                }

                var pickedObject = scene.pick(movement.endPosition);

                if (!Cesium.defined(pickedObject)) {
                    that.dropHoveredPoint();
                    return;
                }

                var entity = pickedObject.id;
                if (entity === that.hoveredPoint)
                    return;

                that.dropHoveredPoint();

                if (that.points.includes(entity))
                    that.makeHoveredPoint(entity);
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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

        this.viewer.scene.screenSpaceCameraController.enableRotate = !dragging;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = !dragging;
        this.viewer.scene.screenSpaceCameraController.enableZoom = !dragging;
        this.viewer.scene.screenSpaceCameraController.enableTilt = !dragging;
        this.viewer.scene.screenSpaceCameraController.enableLook = !dragging;
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
}
