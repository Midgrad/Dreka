class ViewportAdapter {
    constructor(cesium, viewportController) {
        const viewer = cesium.viewer;

        // signals
        viewportController.flyTo.connect(function(latitude, longitude, height, heading, pitch, duration) {
            viewer.camera.flyTo({
                         destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                         orientation : {
                             heading : Cesium.Math.toRadians(heading),
                             pitch : Cesium.Math.toRadians(pitch),
                             roll : 0
                         },
                         duration: duration
                     });
        });

        viewportController.lookTo.connect(function(heading, pitch, duration) {
            viewer.camera.flyTo({
                         destination : viewer.camera.positionWC,
                         orientation : {
                             heading : Cesium.Math.toRadians(heading),
                             pitch : Cesium.Math.toRadians(pitch),
                             roll : viewer.camera.roll
                         },
                         duration: duration
                     });
        });

        var geodesic = new Cesium.EllipsoidGeodesic();

        // event listners
        viewer.scene.canvas.addEventListener('mousemove', function(event) {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            // Mouse over the globe to see the cartographic position
            var cartesian = viewer.camera.pickEllipsoid(
                        new Cesium.Cartesian3(event.clientX, event.clientY), ellipsoid);
            if (cartesian) {
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                viewportController.cursorPosition.latitude = Cesium.Math.toDegrees(cartographic.latitude);
                viewportController.cursorPosition.longitude = Cesium.Math.toDegrees(cartographic.longitude);
                viewportController.cursorPosition.height = cartographic.height;
            } else {
                viewportController.cursorPosition.invalidate();
            }
        });

        viewer.scene.postRender.addEventListener(function() {
            viewportController.heading = Cesium.Math.toDegrees(viewer.camera.heading);
            viewportController.pitch = Cesium.Math.toDegrees(viewer.camera.pitch);

            var position = Cesium.Cartographic.fromCartesian(viewer.camera.positionWC);

            viewportController.position.latitude = Cesium.Math.toDegrees(position.latitude)
            viewportController.position.longitude = Cesium.Math.toDegrees(position.longitude)
            viewportController.position.height = position.height;

            // Find the distance between two pixels at the bottom center of the screen.
            var width = viewer.scene.canvas.clientWidth;
            var height = viewer.scene.canvas.clientHeight;

            var left = viewer.camera.getPickRay(new Cesium.Cartesian2((width / 2) | 0, height - 1));
            var right = viewer.camera.getPickRay(new Cesium.Cartesian2(1 + (width / 2) | 0, height - 1));

            var globe = viewer.scene.globe;
            var leftPosition = globe.pick(left, viewer.scene);
            var rightPosition = globe.pick(right, viewer.scene);

            if (!(leftPosition) || !(rightPosition)) {
                viewportController.metersInPixel = 0;
                return;
            }

            var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
            var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);

            geodesic.setEndPoints(leftCartographic, rightCartographic);
            var pixelDistance = geodesic.surfaceDistance;

            viewportController.metersInPixel = pixelDistance;
        });

        viewportController.restore();
    }
}

