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
            show: false,
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        this.points.push(groundPoint);

        // Waypoint with real altitude
        var waypoint = this.viewer.entities.add({
            position: position,
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
    }

    center() {
        if (this.points.length > 0)
            this.viewer.flyTo(this.lines);
    }

    edit()  {
        this.points.forEach(point => point.show = true);
    }

    unedit() {
        this.points.forEach(point => point.show = false);
    }

    onMove(cartesian) {
        var index = super.onMove(cartesian);
        if (index === -1)
            return;

        var point = Cesium.Cartographic.fromCartesian(cartesian);
        var terrainPoint = Cesium.Cartographic.fromCartesian(this.positions[index]);
        terrainPoint.latitude = point.latitude;
        terrainPoint.longitude = point.longitude;

        // Move point to new place
        this.positions[index] = Cesium.Cartographic.toCartesian(terrainPoint);

        this.waypoints[index].position = this.positions[index];
        this.pylons[index].polyline.positions = [this.positions[index], cartesian];
    }
}

class Routes {
    constructor(cesium) {
        this.viewer = cesium.viewer;

        this.routes = new Map();
        this.editRoute = null
    }

    routeIds() {
        return this.routes.keys();
    }

    centerRoute(routeId) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).center();
    }

    setEditingRoute(routeId) {
        var route = this.routes.has(routeId) ? this.routes.get(routeId) : null;
        if (this.editRoute === route)
            return;

        if (this.editRoute)
            this.editRoute.unedit();

        this.editRoute = route;

        if (this.editRoute)
            this.editRoute.edit();
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
        if (this.editRoute)
            this.editRoute.onUp(cartesian);
    }

    onDown(cartesian) {
        if (this.editRoute)
            this.editRoute.onDown(cartesian);
    }

    onMove(cartesian) {
        if (this.editRoute)
            this.editRoute.onMove(cartesian);
    }

    onPick(pickedObject) {
        if (this.editRoute)
            this.editRoute.onPick(pickedObject);
    }
}
