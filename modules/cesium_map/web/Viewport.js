class Viewport {
    constructor(cesium, viewportController) {

        this.viewer = cesium.viewer;
        this.viewportController = viewportController;

        var that = this;

        // signals
        viewportController.flyTo.connect(function(latitude, longitude, height, heading, pitch, duration) {
            that.viewer.camera.flyTo({
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
            that.viewer.camera.flyTo({
                         destination : that.viewer.camera.positionWC,
                         orientation : {
                             heading : Cesium.Math.toRadians(heading),
                             pitch : Cesium.Math.toRadians(pitch),
                             roll : that.viewer.camera.roll
                         },
                         duration: duration
                     });
        });

        var geodesic = new Cesium.EllipsoidGeodesic();
        this.viewer.scene.postRender.addEventListener(function() {
            viewportController.heading = Cesium.Math.toDegrees(that.viewer.camera.heading);
            viewportController.pitch = Cesium.Math.toDegrees(that.viewer.camera.pitch);

            var position = Cesium.Cartographic.fromCartesian(that.viewer.camera.positionWC);

            viewportController.position.latitude = Cesium.Math.toDegrees(position.latitude)
            viewportController.position.longitude = Cesium.Math.toDegrees(position.longitude)
            viewportController.position.height = position.height;

            // Find the distance between two pixels at the bottom center of the screen.
            var width = that.viewer.scene.canvas.clientWidth;
            var height = that.viewer.scene.canvas.clientHeight;

            var left = that.viewer.camera.getPickRay(new Cesium.Cartesian2((width / 2) | 0, height - 1));
            var right = that.viewer.camera.getPickRay(new Cesium.Cartesian2(1 + (width / 2) | 0, height - 1));

            var globe = that.viewer.scene.globe;
            var leftPosition = globe.pick(left, that.viewer.scene);
            var rightPosition = globe.pick(right, that.viewer.scene);

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

    onMove(cartesian) {
        if (Cesium.defined(cartesian)) {
            var cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);

            this.viewportController.cursorPosition.latitude = Cesium.Math.toDegrees(cartographic.latitude);
            this.viewportController.cursorPosition.longitude = Cesium.Math.toDegrees(cartographic.longitude);
            this.viewportController.cursorPosition.height = cartographic.height;
        } else {
            this.viewportController.cursorPosition.invalidate();
        }
    }
}
