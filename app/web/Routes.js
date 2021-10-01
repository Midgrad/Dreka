class Route extends Draggable {
    constructor(viewer) {
        super(cesium.viewer);

        this.lineWidth = 3.0;
        this.normalScale = 1.0;
        this.hoveredScale = 1.5;
        this.homeAltitude = 0.0;
        this.data = {};

        var that = this;

        this.lines = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function() { return that.positions; }, false),
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
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scale: this.normalScale
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
            this.viewer.flyTo(this.lines);
    }

    makeHoveredPoint(point) {
        point.billboard.scale = this.hoveredScale;
        super.makeHoveredPoint(point);
    }

    dropHoveredPoint() {
        if (!this.hoveredPoint)
            return;

        this.hoveredPoint.billboard.scale = this.normalScale;
        super.dropHoveredPoint();
    }

//    onMove(cartesian) {
//        if (!super.onMove(cartesian))
//            return;
//    }
}

class Routes {
    constructor(cesium) {
        this.viewer = cesium.viewer;

        this.routes = new Map();
    }

    routeIds() {
        return this.routes.keys();
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
        this.routes.forEach((route) => { route.clear(); } );
        this.routes.clear();
    }

    onUp(cartesian) {
        this.routes.forEach((route) => { route.onUp(cartesian); } );
    }

    onDown(cartesian) {
        this.routes.forEach((route) => { route.onDown(cartesian); } );
    }

    onMove(cartesian) {
        this.routes.forEach((route) => { route.onMove(cartesian); } );
    }

    onPick(pickedObject) {
        this.routes.forEach((route) => { route.onPick(pickedObject); } );
    }
}
