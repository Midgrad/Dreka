class Route {
    constructor(viewer) {

        this.points = [];
        this.viewer = viewer;

        this.waypointPixelSize = 8.0;
        this.data = {};
    }

    setData(routeData) {
        this.data = routeData;

        routeData.waypoints.forEach((wpt) => { this.addWaypoint(wpt); } );
    }

    addWaypoint(wpt) {
        var pos = wpt.position;
        var cartesian = Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.altitude);

        if (!Cesium.defined(cartesian))
            return;

        var point = this.viewer.entities.add({
            position: cartesian,
            show: this.data.visible,
            billboard: {
                image: "./icons/wpt.svg",
                color: Cesium.Color.WHITE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
        this.points.push(point);
    }

    done() {
        for (var i = 0; i < this.points.length; ++i) {
            this.viewer.entities.remove(this.points[i]);
        }
        this.points = [];
    }

    center() {
        if (this.points.length > 0)
            this.viewer.flyTo(this.points[0]);
    }
}

class Routes {
    constructor(cesium) {
        this.viewer = cesium.viewer;

        this.routes = new Map();
    }

    centerRoute(routeId) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).center();
    }

    setRouteData(routeId, data) {
        var route;
        if (this.routes.has(routeId)) {
            route = this.routes.get(routeId);
        } else {
            route = new Route(this.viewer, routeId, this)
            this.routes.set(routeId, route);
        }
        route.setData(data);
    }

    removeRoute(routeId) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).done();
        this.routes.delete(routeId);
    }

    clear() {
        this.routes.forEach((value) => { value.done(); } );
        this.routes.clear();
    }
}
