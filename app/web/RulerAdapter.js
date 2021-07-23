class RulerAdapter {
    constructor(cesium, rulerController) {

        this.viewer = cesium.viewer;

        this.points = [];
        this.lines = [];
        this.lastPosition = null;

        var that = this;
        var scene = this.viewer.scene;

        // clear signal
        rulerController.clear.connect(function() {
            that.clear();

            rulerController.empty = true;
            rulerController.distance = 0;
        });

        // Left click to add ruler points
        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        handler.setInputAction(function(event) {
            // Ignore with no ruler mode
            if (!rulerController.rulerMode)
                return;

            // PickPosition is currently only supported in 3D mode
            if (!scene.pickPositionSupported ||
                    scene.mode !== Cesium.SceneMode.SCENE3D)
                return;

            var cartesian = that.viewer.scene.pickPosition(event.position);
            if (Cesium.defined(cartesian)) {
                //cartesian.z += 10;

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
    }

    addPoint(cartesian) {
        if (this.lastPosition) {
            this.lines.push(this.viewer.entities.add({
                polyline: {
                    positions: [this.lastPosition, cartesian],
                    arcType: Cesium.ArcType.GEODESIC,
                    width : 4.0,
                    material : Cesium.Color.CADETBLUE,
                    depthFailMaterial: Cesium.Color.CADETBLUE,
                }
            }));
        }

        this.points.push(this.viewer.entities.add({
            position: cartesian,
            point: {
                pixelSize: 8,
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
}
