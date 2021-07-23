class RulerAdapter {
    constructor(cesium, rulerController) {

        const viewer = cesium.viewer;
        var points = [];

        // signals
        rulerController.clear.connect(function() {
            for (var i = 0; i < points.length; i++) {
                viewer.entities.remove(points[i]);
            }
            rulerController.empty = true;
        });

        // event listners
        viewer.scene.canvas.addEventListener('click', function(event) {
            if (!rulerController.rulerMode)
                return;

            var mousePosition = new Cesium.Cartesian2(event.clientX, event.clientY);

            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);

            if (cartesian) {
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                points.push(viewer.entities.add({
                    position: cartesian,
                    point: {
                        pixelSize: 4,
                        color: Cesium.Color.ALICEBLUE,
                        outlineColor: Cesium.Color.AQUAMARINE,
                        outlineWidth: 2,
                        heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND,
                        scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
                    }
                }));
                rulerController.empty = false;
            }
        }, false);
    }
}
