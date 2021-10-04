// TODO: waypoint class

class Route extends Draggable {
    constructor(viewer) {
        super(cesium.viewer);

        // Visual
        this.lineWidth = 3.0;
        this.normalScale = 1.0;
        this.hoveredScale = 1.5;
        this.homeAltitude = 0.0;
        this.visible = true;

        // Cartesian coordinates
        this.positions = [];
        this.terrainPositions = [];

        // Entities
        this.waypoints = [];
        this.pylons = [];

        var that = this;
        this.lines = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function() { return that.positions; }, false),
                arcType: Cesium.ArcType.GEODESIC,
                width : this.lineWidth,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.WHITE,
                    outlineWidth: 1,
                    outlineColor: Cesium.Color.BLACK,
                })
            }
        });
    }

    setData(routeData) {
        this.clear();
        this.visible = routeData.visible;

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

        var position = Cesium.Cartesian3.fromDegrees(params.longitude, params.latitude, altitude);

        if (!Cesium.defined(position))
            return;

        this.positions.push(position);

        // Add draggable point on the ground
        var groundPoint = this.viewer.entities.add({
            position: position,
            show: this.visible,
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.GAINSBORO,
                heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        this.points.push(groundPoint);

        // Waypoint with real altitude
        var waypoint = this.viewer.entities.add({
            position: position,
            show: this.visible,
            billboard: {
                image: "./icons/wpt.svg",
                color: Cesium.Color.WHITE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scale: this.normalScale
            }
        });
        this.waypoints.push(waypoint);

        var heightMaps = this.viewer.terrainProvider;
        var terrainPosition = Cesium.Cartographic.fromDegrees(params.longitude, params.latitude, 0);
        this.terrainPositions.push(terrainPosition);

        // TODO: unified terrain check
        var heightCheck = setInterval(function () {
            if (heightMaps.ready) {
                clearInterval(heightCheck);

                var promise =  Cesium.sampleTerrainMostDetailed(heightMaps, [terrainPosition]);
                Cesium.when(promise, updatedPositions => {});
            }
        }, 1000);

        // Arrow to the ground
        var pylon = this.viewer.entities.add({
             show: this.visible,
             polyline: {
                 positions: new Cesium.CallbackProperty(function() {
                     return [position, Cesium.Cartographic.toCartesian(terrainPosition)];
                 }, false),
                 width: 5,
                 arcType: Cesium.ArcType.NONE,
                 material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GAINSBORO)
             }
        });
        this.pylons.push(pylon);
    }

    clear() {
        super.clear();

        for (var i = 0; i < this.waypoints.length; ++i) {
            this.viewer.entities.remove(this.waypoints[i]);
        }
        this.waypoints = [];

        for (i = 0; i < this.pylons.length; ++i) {
            this.viewer.entities.remove(this.pylons[i]);
        }
        this.pylons = [];

        this.positions = [];
        this.terrainPositions = [];
    }

    center() {
        if (this.points.length > 0)
            this.viewer.flyTo(this.lines);
    }

    onMove(cartesian) {
        var index = super.onMove(cartesian);
        if (index === -1)
            return;

        // Move point to new place
        this.positions[index].x = cartesian.x;
        this.positions[index].y = cartesian.y;

        this.terrainPositions[index] = cartesian;
    }
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
