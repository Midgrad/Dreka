class Route extends Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        super(viewer, input)

        // Callbacks
        this.waypointChangedCallback = null;
        this.waypointClickedCallback = null;

        // Data
        this.editMode = false;
        this.enabled = false;

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
            waypoint.setEditMode(this.editMode);
            this.waypoints.push(waypoint);

            if (this.waypointChangedCallback) {
                var that = this;
                waypoint.changedCallback = (waypointData) => {
                    that.waypointChangedCallback(index, waypointData);
                }
            }
        }
    }

    clear() {
        this.viewer.entities.remove(this.lines);

        this.waypoints.forEach(waypoint => waypoint.clear());
        this.waypoints = [];
    }

    center() {
        if (this.waypoints.length > 0)
            this.viewer.flyTo(this.lines);
    }

    centerWaypoint(index) {
        if (this.waypoints.length > index)
            this.waypoints[index].flyTo();
    }

    setEditMode(editMode) {
        this.editMode = editMode;
        this.enabled = editMode;
        this.waypoints.forEach(waypoint => waypoint.setEditMode(editMode));
    }

    onClick(cartesian, x, y, objects) {
        if (!this.waypointClickedCallback)
            return;
        // Try to pick point
        for (var index = 0; index < this.waypoints.length; ++index) {
            if (this.waypoints[index].checkMatchPoint(objects))
                this.waypointClickedCallback(index, x, y);
        }
    }

    onPick(pickedObjects) {
        if (super.onPick(pickedObjects))
            return true;

        // Try to pick ground point
        this.waypoints.forEach(candidate => {
            if (candidate.checkMatchGroundPoint(pickedObjects))
                this.setHoveredPoint(candidate);
        });
    }

    onMove(cartesian) {
        if (this.hoveredPoint && this.hoveredPoint.dragging) {
            this.hoveredPoint.onMove(cartesian);
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

        // Callbacks
        this.waypointChangedCallback = null;
        this.waypointClickedCallback = null;

        // Entities
        this.routes = new Map();
        this.editingRoute = null
    }

    setEditingRoute(routeId) {
        var route = this.routes.has(routeId) ? this.routes.get(routeId) : null;

        if (this.editingRoute === route)
            return;

        if (this.editingRoute)
            this.editingRoute.setEditMode(false);

        this.editingRoute = route;

        if (this.editingRoute)
            this.editingRoute.setEditMode(true);
    }

    centerRoute(routeId) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).center();
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

            if (this.waypointChangedCallback) {
                var that = this;
                route.waypointChangedCallback = (index, waypointData) => {
                    that.waypointChangedCallback(routeId, index, waypointData);
                }
                route.waypointClickedCallback = (index, x, y) => {
                    that.waypointClickedCallback(routeId, index, x, y);
                }
            }
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
