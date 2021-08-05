class Ruler {
    constructor(cesium, rulerController) {

        this.viewer = cesium.viewer;

        this.pointPixelSize = 8.0;
        this.hoveredPointPixelSize = 16.0;
        this.lineWidth = 4.0;

        this.points = [];
        this.lines = [];
        this.lastPosition = null;
        this.hoveredPoint = null;

        var that = this;
        var scene = this.viewer.scene;

        // clear signal
        rulerController.clear.connect(function() {
            that.clear();

            rulerController.empty = true;
            rulerController.distance = 0;
        });

        // Left click to add ruler points
        var addHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        addHandler.setInputAction(function(event) {
            // Ignore with no ruler mode
            if (!rulerController.rulerMode)
                return;

            // PickPosition is currently only supported in 3D mode
            if (!scene.pickPositionSupported ||
                    scene.mode !== Cesium.SceneMode.SCENE3D)
                return;

            var cartesian = that.viewer.scene.pickPosition(event.position);
            if (Cesium.defined(cartesian)) {
                that.addPoint(cartesian);

                // Not empty now
                rulerController.empty = false;

                // Update ruler distance
                if (that.lastPosition) {
                    rulerController.distance +=
                            Cesium.Cartesian3.distance(that.lastPosition, cartesian);
                }
                that.lastPosition = cartesian;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // pick hovered points
        var moveHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
            moveHandler.setInputAction(function (movement) {
                var pickedObject = scene.pick(movement.endPosition);

                if (!Cesium.defined(pickedObject)) {
                    that.dropHoveredPoint();
                    return;
                }

                var entity = pickedObject.id;

                if (entity === that.hoveredPoint)
                    return;

                that.dropHoveredPoint();

                if (that.points.includes(entity)) {
                    entity.point.pixelSize = that.hoveredPointPixelSize;
                    that.hoveredPoint = entity;
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    addPoint(cartesian) {
        if (this.lastPosition) {
            this.lines.push(this.viewer.entities.add({
                position: this.intermediate(this.lastPosition, cartesian),
                polyline: {
                    positions: [this.lastPosition, cartesian],
                    arcType: Cesium.ArcType.GEODESIC,
                    width : this.lineWidth,
                    material : Cesium.Color.CADETBLUE,
                    depthFailMaterial: Cesium.Color.CADETBLUE
                },
                label: {
                    text: Cesium.Cartesian3.distance(this.lastPosition, cartesian).toFixed(2),
                    showBackground: true,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    pixelOffset: new Cesium.Cartesian2(0, -25),
                    font: "13px Helvetica"
                }
            }));
        }

        this.points.push(this.viewer.entities.add({
            position: cartesian,
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
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

        this.lastPosition = null;
    }

    intermediate(first, second) {
        var scratch = new Cesium.Cartesian3();

        var difference = Cesium.Cartesian3.subtract(first, second, scratch);
        var distance = -0.5 * Cesium.Cartesian3.magnitude(difference);
        var direction = Cesium.Cartesian3.normalize(difference, scratch);

        return Cesium.Cartesian3.add(first, Cesium.Cartesian3.multiplyByScalar(
                                            direction, distance, scratch), scratch);
    }

    dropHoveredPoint() {
        if (!this.hoveredPoint)
            return;

        this.hoveredPoint.point.pixelSize = this.pointPixelSize;
        this.hoveredPoint = null;
    }
}
