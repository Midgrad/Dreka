class Viewport {
    constructor(viewer) {

        this.viewer = viewer;
        this.cameraHandlers = [];
        this.cursorHandlers = [];

        this.heading = 0;
        this.pitch = 0;
        this.pixelScale = 0;
        this.cameraPosition = {};
        this.centerPosition = {};
        this.cursorPosition = {};

        var geodesic = new Cesium.EllipsoidGeodesic();
        var that = this;
        // Do it every time postRender, cause camera.changed is too slow
        this.viewer.scene.postRender.addEventListener(function() {

            var newCameraPosition = that.convert(Cesium.Cartographic.fromCartesian(
                                                     that.viewer.camera.positionWC));
            var newWidth = that.viewer.scene.canvas.clientWidth;
            var newHeight = that.viewer.scene.canvas.clientHeight

            if (Cesium.Cartographic.equals(that.cameraPosition, newCameraPosition) &&
                that.width === newWidth &&
                that.height === newHeight)
                return;

            // Get the camera position
            that.cameraPosition = newCameraPosition;

            // Get camera pitch & roll
            that.heading = Cesium.Math.toDegrees(that.viewer.camera.heading);
            that.pitch = Cesium.Math.toDegrees(that.viewer.camera.pitch);

            // Find map center coordinates
            var globe = that.viewer.scene.globe;
            that.width = newWidth;
            that.height = newHeight;

            var center = that.viewer.camera.getPickRay(new Cesium.Cartesian2(that.width / 2, that.height / 2));
            var centerPosition = globe.pick(center, that.viewer.scene);
            if (Cesium.defined(centerPosition)) {
                that.centerPosition = that.convert(globe.ellipsoid.cartesianToCartographic(centerPosition));
            }

            // Find the distance between two pixels int the center of the screen.
            var left = that.viewer.camera.getPickRay(new Cesium.Cartesian2((that.width / 2) | 0, that.height / 2));
            var right = that.viewer.camera.getPickRay(new Cesium.Cartesian2(1 + (that.width / 2) | 0, that.height / 2));

            var leftPosition = globe.pick(left, that.viewer.scene);
            var rightPosition = globe.pick(right, that.viewer.scene);

            if (Cesium.defined(leftPosition) && Cesium.defined(rightPosition)) {
                var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
                var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);

                geodesic.setEndPoints(leftCartographic, rightCartographic);
                var pixelDistance = geodesic.surfaceDistance;

                that.pixelScale = pixelDistance;
            } else {
                that.pixelScale = 0;
            }

            that.cameraHandlers.forEach(handler => handler(that.heading, that.pitch,
                                                           that.cameraPosition, that.centerPosition,
                                                           that.pixelScale));
        });
    }

    onMove(cartesian) {
         // Get mouse position
        if (Cesium.defined(cartesian)) {
            var position = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            this.cursorPosition = this.convert(position);
        } else {
            this.cursorPosition = {};
        }

        this.cursorHandlers.forEach(handler => handler(this.cursorPosition));
        return false;
    }

    flyTo(center, heading, pitch, duration) {
        this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(center.longitude, center.latitude, center.altitude),
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
            destination : Cesium.Cartesian3.fromDegrees(this.centerPosition.longitude,
                                                        this.centerPosition.latitude,
                                                        this.cameraPosition.altitude),
            orientation : {
                heading : Cesium.Math.toRadians(heading),
                pitch : Cesium.Math.toRadians(pitch),
                roll : this.viewer.camera.roll
            },
            duration: duration
        });
    };

    subscribeCamera(handler) {
        this.cameraHandlers.push(handler);
    }

    unsubscribeCamera(handler) {
        this.cameraHandlers = this.cameraHandlers.filter(item => item !== handler)
    }

    subscribeCursor(handler) {
        this.cursorHandlers.push(handler);
    }

    unsubscribeCursor(handler) {
        this.cursorHandlers = this.cursorHandlers.filter(item => item !== handler)
    }

    convert(position) {
        return {
            latitude: Cesium.Math.toDegrees(position.latitude),
            longitude: Cesium.Math.toDegrees(position.longitude),
            altitude: position.height
        };
    }
}
