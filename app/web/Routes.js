class Routes {
    constructor(cesium) {

        this.points = [];
        this.viewer = cesium.viewer;

        this.waypointPixelSize = 8.0;

        var that = this;
    }

    setRoutes(routes) {
        this.clear();

        routes.forEach((route) => { this.addRoute(route); } );
    }

    addRoute(route) {
        route.waypoints.forEach((wpt) => { this.addWaypoint(wpt); } );
    }

    addWaypoint(wpt) {
        var pos = wpt.position;
        var cartesian = Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.altitude);

        if (!Cesium.defined(cartesian))
            return;

        var point = this.viewer.entities.add({
            position: cartesian,
            point: {
                pixelSize: this.waypointPixelSize,
                color: Cesium.Color.CADETBLUE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
        });
        this.points.push(point);
    }

    clear() {
        for (var i = 0; i < this.points.length; ++i) {
            this.viewer.entities.remove(this.points[i]);
        }
        this.points = [];
    }

    // TODO: callback to get ray from camera to ground
}
