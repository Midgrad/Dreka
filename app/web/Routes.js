class Route {
    constructor(viewer) {

        this.viewer = viewer;

        this.lineWidth = 1.0;
        this.homeAltitude = 0.0;
        this.positions = [];
        this.data = {};

        var that = this;

        this.points = [];
        this.lines = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function() {
                    return that.positions;
                }, false),
                arcType: Cesium.ArcType.GEODESIC,
                width : this.lineWidth,
                material: Cesium.Color.WHITE
            }
        });
    }

    setData(routeData) {
        this.clear();
        this.data = routeData;

        routeData.waypoints.forEach((wpt) => { this.addWaypoint(wpt); } );
    }

    addWaypoint(wpt) {
        var params = wpt.params;
        var altitude = params.altitude;

        // Home altitude form first waypoint to waypoints with relative flag
        if (this.points.length === 0)
            this.homeAltitude = altitude;
        else if (Cesium.defined(params.relative) && params.relative)
            altitude += this.homeAltitude;

        var cartesian = Cesium.Cartesian3.fromDegrees(params.longitude, params.latitude, altitude);

        if (!Cesium.defined(cartesian))
            return;

        this.positions.push(cartesian);

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

    clear() {
        for (var i = 0; i < this.points.length; ++i) {
            this.viewer.entities.remove(this.points[i]);
        }
        this.points = [];
        this.positions = [];
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

        this.routes.get(routeId).clear();
        this.routes.delete(routeId);
    }

    clear() {
        this.routes.forEach((value) => { value.clear(); } );
        this.routes.clear();
    }
}
