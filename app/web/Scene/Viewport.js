class Viewport {
    constructor(viewer) {

        this.viewer = viewer;
        this.cameraHandlers = [];
        this.cursorHandlers = [];

        this.heading = 0;
        this.pitch = 0;
        this.pixelScale = 0;
        this.cameraPosition = null;
        this.centerPosition = {};
        this.cursorPosition = {};

        var that = this;
        // Do it every time postRender, cause camera.changed is too slow
        this.viewer.scene.postRender.addEventListener(() => { that.tick(); });
    }

    tick() {
        var geodesic = new Cesium.EllipsoidGeodesic();
        var newCameraPosition = this.convert(Cesium.Cartographic.fromCartesian(
                                                 this.viewer.camera.positionWC));
        var newWidth = this.viewer.scene.canvas.clientWidth;
        var newHeight = this.viewer.scene.canvas.clientHeight

        // Get the camera position
        this.cameraPosition = newCameraPosition;

        // Get camera pitch & roll
        this.heading = Cesium.Math.toDegrees(this.viewer.camera.heading);
        this.pitch = Cesium.Math.toDegrees(this.viewer.camera.pitch);

        // Find map center coordinates
        var globe = this.viewer.scene.globe;
        this.width = newWidth;
        this.height = newHeight;

        var center = this.viewer.camera.getPickRay(new Cesium.Cartesian2(this.width / 2, this.height / 2));
        var centerPosition = globe.pick(center, this.viewer.scene);
        if (Cesium.defined(centerPosition)) {
            this.centerPosition = this.convert(globe.ellipsoid.cartesianToCartographic(centerPosition));
        }

        // Find the distance between two pixels int the center of the screen.
        var left = this.viewer.camera.getPickRay(new Cesium.Cartesian2((this.width / 2) | 0, this.height / 2));
        var right = this.viewer.camera.getPickRay(new Cesium.Cartesian2(1 + (this.width / 2) | 0, this.height / 2));

        var leftPosition = globe.pick(left, this.viewer.scene);
        var rightPosition = globe.pick(right, this.viewer.scene);

        if (Cesium.defined(leftPosition) && Cesium.defined(rightPosition)) {
            var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
            var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);

            geodesic.setEndPoints(leftCartographic, rightCartographic);
            this.pixelScale = geodesic.surfaceDistance;
        } else {
            this.pixelScale = 0;
        }

        this.cameraHandlers.forEach(handler => handler(this.heading, this.pitch,
                                                       this.cameraPosition, this.centerPosition,
                                                       this.pixelScale));
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
