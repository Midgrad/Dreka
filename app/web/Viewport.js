class Viewport {
    constructor(cesium, viewportController) {

        this.viewer = cesium.viewer;
        this.viewportController = viewportController;
        var that = this;

        var geodesic = new Cesium.EllipsoidGeodesic();
        this.viewer.scene.postRender.addEventListener(function() {
            // Get camera pitch & roll
            viewportController.heading = Cesium.Math.toDegrees(that.viewer.camera.heading);
            viewportController.pitch = Cesium.Math.toDegrees(that.viewer.camera.pitch);

            // Get the camera position
            var cartographic = Cesium.Cartographic.fromCartesian(that.viewer.camera.positionWC);
            var converted = {
                latitude: Cesium.Math.toDegrees(cartographic.latitude),
                longitude: Cesium.Math.toDegrees(cartographic.longitude),
                altitude: cartographic.height
            };
            viewportController.centerPosition = converted; // TODO: cameraPosition

            // Find map center coordinates
            var width = that.viewer.scene.canvas.clientWidth;
            var height = that.viewer.scene.canvas.clientHeight;

            var center = that.viewer.camera.getPickRay(new Cesium.Cartesian2(width / 2, height / 2));
            if (center) {
                // TODO: viewportController.centerPosition = converted;
            }

            // Find the distance between two pixels int the center of the screen.
            var left = that.viewer.camera.getPickRay(new Cesium.Cartesian2((width / 2) | 0, height / 2));
            var right = that.viewer.camera.getPickRay(new Cesium.Cartesian2(1 + (width / 2) | 0, height / 2));

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
    }

    onMove(cartesian) {
         // Get mouse position
        if (Cesium.defined(cartesian)) {
            var cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            var converted = {
                latitude: Cesium.Math.toDegrees(cartographic.latitude),
                longitude: Cesium.Math.toDegrees(cartographic.longitude),
                altitude: cartographic.height
            };
            this.viewportController.cursorPosition = converted;
        } else {
            this.viewportController.cursorPosition = {};
        }
    }

    flyTo(latitude, longitude, height, heading, pitch, duration) {
        this.viewer.camera.flyTo({
             destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
             orientation : {
                 heading : Cesium.Math.toRadians(heading),
                 pitch : Cesium.Math.toRadians(pitch),
                 roll : 0
             },
             duration: duration
         });
    }

    lookTo(heading, pitch, duration) {
        this.viewer.camera.flyTo({
            destination : this.viewer.camera.positionWC,
            orientation : {
                heading : Cesium.Math.toRadians(heading),
                pitch : Cesium.Math.toRadians(pitch),
                roll : that.viewer.camera.roll
            },
            duration: duration
        });
    };
}
