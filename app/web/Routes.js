class Route extends Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        super(viewer, input)

        // Visual
        this.lineWidth = 3.0;

        // Entities
        this.waypoints = [];

        // Nominal track
        var that = this;
        this.lines = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    var positions = [];
                    that.waypoints.forEach(waypoint => { positions.push(waypoint.position); });
                    return positions;
                }, false),
                arcType: Cesium.ArcType.GEODESIC,
                width : new Cesium.CallbackProperty(() => { return that.lineWidth; }, false),
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.WHITE,
                    outlineWidth: 1,
                    outlineColor: Cesium.Color.BLACK,
                })
            }
        });
    }

    setRouteData(routeData) {
        //this.visible = routeData.visible;
        this.name = routeData.name;
    }

    setWaypoint(index, waypointData) {
        // TODO: relative latitude
        //        // Home altitude form first waypoint to waypoints with relative flag
        //        if (this.points.length === 0)
        //            this.homeAltitude = altitude;
        //        else if (Cesium.defined(params.relative) && params.relative)
        //            altitude += this.homeAltitude;
        if (this.waypoints.length > index) {
            this.waypoints[index].update(waypointData);
        } else {
            var waypoint = new Waypoint(this.viewer, waypointData);
            this.waypoints.push(waypoint);
        }
    }

    clear() {
        // super.clear();

        this.viewer.entities.remove(this.lines);

        this.waypoints.forEach(waypoint => waypoint.clear());
        this.waypoints = [];
    }

    center() {
        if (this.points.length > 0)
            this.viewer.flyTo(this.lines);
    }

    centerWaypoint(index) {
        if (this.waypoints.length > index)
            this.waypoints[index].flyTo();
    }

    setEditMode(edit) { // TODO: unify with dragEnabled
        this.waypoints.forEach(waypoint => waypoint.setEditMode(edit));
    }

    onClick(cartesian) {
        // TODO: invoke add new point
    }

    onPick(pickedObjects) {
        if (super.onPick(pickedObjects))
            return true;

        // Try to pick new point
        this.waypoints.forEach(candidate => {
            if (candidate.checkMatch(pickedObjects))
                this.setHoveredPoint(candidate);
        });
    }

    onMove(cartesian) {
        if (this.hoveredPoint && this.hoveredPoint.dragging) {
            this.hoveredPoint.updatePosition(cartesian, true);
        }
    }

    onMoveShift(dx, dy) {
        if (this.hoveredPoint && this.hoveredPoint.dragging) {
            this.hoveredPoint.onMoveShift(dx, dy);
        }
    }
}

class Routes {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;
        this.input = input;

        // Entities
        this.routes = new Map();
        this.editingRoute = null
    }

    centerRoute(routeId) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).center();
    }

    setEditingRoute(routeId) {
        var route = this.routes.has(routeId) ? this.routes.get(routeId) : null;
        if (this.editingRoute === route)
            return;

        if (this.editingRoute) {
            this.editingRoute.setEditMode(false);
            this.input.unsubscribe(this.editingRoute);
        }

        this.editingRoute = route;

        if (this.editingRoute) {
            this.editingRoute.setEditMode(true);
            this.input.subscribe(this.editingRoute);
        }
    }

    centerWaypoint(routeId, index) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).centerWaypoint(index);
    }

    setRouteData(routeId, data) {
        var route;
        if (this.routes.has(routeId)) {
            route = this.routes.get(routeId);
        } else {
            route = new Route(this.viewer, this.input)
            this.routes.set(routeId, route);
        }
        route.setRouteData(data);
    }

    setWaypointData(routeId, index, waypointData) {
        this.routes.get(routeId).setWaypoint(index, waypointData);
    }

    removeRoute(routeId) {
        this.routes.get(routeId).clear();
        this.routes.delete(routeId);
    }

    removeWaypoint(routeId, index) {
        this.routes.get(routeId).removeWaypoint(index);
    }

    clear() {
        this.routes.forEach(route => { route.clear(); } );
        this.routes.clear();
    }
}
