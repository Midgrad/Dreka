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

        // Entities
        this.waypoints = [];
        // Nominal track
        this.lines = [];
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
            waypoint.index = index;
            waypoint.setEditMode(this.editMode);
            this.waypoints.push(waypoint);

            if (this.waypointChangedCallback) {
                var that = this;
                waypoint.changedCallback = (waypointData) => {
                    that.waypointChangedCallback(waypoint.index, waypointData);
                }
            }
            // Add line
            if (this.waypoints.length > 1)
                this.addLine(this.waypoints[index - 1], this.waypoints[index]);
        }
    }

    addLine(first, second) {
        var that = this;
        var line = this.viewer.entities.add({
            polyline: {
                show: new Cesium.CallbackProperty(() => { return first.validPosition && second.validPosition; }, false),
                positions: new Cesium.CallbackProperty(() => { return [first.position, second.position]; }, false),
                arcType: Cesium.ArcType.GEODESIC,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.WHITE),
                width: 8.0
            }
        });
        this.lines.push(line);
    }

    clear() {
        var that = this;
        this.lines.forEach(line => that.viewer.entities.remove(line));
        this.lines = [];

        this.waypoints.forEach(waypoint => waypoint.clear());
        this.waypoints = [];
    }

    removeWaypoint(index) {
        var removeIndex = index < this.lines.length ? index : index - 1;
        var updateIndex = removeIndex - 1;

        // Remove waypoint entity
        this.waypoints[index].clear();
        this.waypoints.splice(index, 1);

        // Remove one line
        this.viewer.entities.remove(this.lines[removeIndex]);
        this.lines.splice(removeIndex, 1);

        // Update another line
        if (updateIndex > -1) {
            var left = this.waypoints[updateIndex];
            var right = this.waypoints[updateIndex + 1];
            this.lines[updateIndex].polyline.positions = new Cesium.CallbackProperty(() => {
                return [left.position, right.position];
            }, false);
            this.lines[updateIndex].polyline.show =  new Cesium.CallbackProperty(() => {
                return left.validPosition && right.validPosition;
            }, false);
        }

        // Update indices
        for (var i = index; i < this.waypoints.length; ++i)
            this.waypoints[i].index = i;
    }

    center() {
        this.viewer.flyTo(this.lines);
    }

    centerWaypoint(index) {
        this.waypoints[index].flyTo();
    }

    setEditMode(editMode) {
        this.editMode = editMode;
        this.enabled = editMode;
        this.waypoints.forEach(waypoint => waypoint.setEditMode(editMode));
    }
    // TODO: deep to waypoint
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

        var hovered = null;
        this.waypoints.forEach(candidate => {
            if (candidate.onPick(pickedObjects))
                hovered = candidate;
        });

        if (hovered)
            this.setHoveredPoint(hovered);
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
