class Route {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;
        this.input = input;

        // Callbacks
        this.waypointChangedCallback = null;
        this.calcDataChangedCallback = null;
        this.waypointClickedCallback = null;

        // Data
        this.editMode = false;
        this.selectedIndex = -1;

        // Entities
        this.waypoints = [];
        // Nominal track
        this.lines = [];
    }

    clear() {
        var that = this;
        this.lines.forEach(line => that.viewer.entities.remove(line));
        this.lines = [];

        this.waypoints.forEach(waypoint => waypoint.clear());
        this.waypoints = [];
    }

    setRouteData(routeData) {
        //this.visible = routeData.visible;
        this.name = routeData.name;
    }

    setWaypoint(index, waypointData) {
        // TODO: relative latitude
        if (this.waypoints.length > index) {
            this.waypoints[index].update(waypointData);
        } else if (this.waypoints.length === index) {
            var waypoint = new Waypoint(this.viewer, this.input, waypointData, index);
            waypoint.setEditMode(this.editMode);
            this.waypoints.push(waypoint);

            // Callbacks
            var that = this;
            waypoint.changedCallback = () => {
                // Update calculated data for changed and next wpt
                that._updateCalcData(waypoint);
                if (that.waypoints.length > waypoint.index + 1)
                    that._updateCalcData(this.waypoints[index + 1]);

                that.waypointChangedCallback(waypoint.index, waypoint.waypointData);
            }
            waypoint.clickedCallback = (x, y) => {
                that.waypointClickedCallback(waypoint.index, x, y);
            }

            // Add line
            if (this.waypoints.length > 1)
                this._addLine(this.waypoints[index - 1], this.waypoints[index]);

            this._updateCalcData(waypoint);
        } else {
            console.warn("Wrong wpt index in setWaypoint")
        }
    }

    setEditMode(editMode) {
        this.editMode = editMode;
        this.waypoints.forEach(waypoint => waypoint.setEditMode(editMode));
    }

    setWaypointSelected(index, selected) {
        this.waypoints[index].setWaypointSelected(selected);

        if (selected)
            this.selectedIndex = index;
        else if (this.selectedIndex === index)
            this.selectedIndex = null;
    }

    selectedWaypointPosition() {
        if (Cesium.defined(this.selectedIndex) &&
            this.selectedIndex > -1 &&
            this.selectedIndex < this.waypoints.length)
            return this.waypoints[this.selectedIndex].waypointPosition();

        return undefined;
    }

    removeWaypoint(index) {
        if (this.selectedIndex === index) {
            this.waypoints[index].setWaypointSelected(false);
            this.selectedIndex = null;
        }

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

    _addLine(first, second) {
        var that = this;
        var line = this.viewer.entities.add({
            polyline: {
                show: new Cesium.CallbackProperty(() => { return first.validPosition &&
                                                                 second.validPosition; }, false),
                positions: new Cesium.CallbackProperty(() => { return [first.position,
                                                                       second.position]; }, false),
                arcType: Cesium.ArcType.GEODESIC,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.WHITE),
                width: 8.0
            }
        });
        this.lines.push(line);
    }

    _updateCalcData(waypoint) {
        var index = waypoint.index;
        var calcData = waypoint.waypointData.calcData;

        var distance = index > 0 ? Cesium.Cartesian3.distance(
                                      waypoint.position, this.waypoints[index - 1].position) :
                                      undefined;
        calcData.distance = distance;

        waypoint.waypointData.calcData = calcData;
        this.calcDataChangedCallback(index, calcData);
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
        this.calcDataChangedCallback = null;
        this.waypointClickedCallback = null;

        // Entities
        this.routes = new Map();
        this.editingRoute = null;
        this.selectedRoute = null;
    }

    clear() {
        this.routes.forEach(route => { route.clear(); } );
        this.routes.clear();
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

    setRouteData(routeId, data) {
        var route;
        if (this.routes.has(routeId)) {
            route = this.routes.get(routeId);
        } else {
            route = new Route(this.viewer, this.input)
            this.routes.set(routeId, route);

            var that = this;
            route.waypointChangedCallback = (index, waypointData) => {
                that.waypointChangedCallback(routeId, index, waypointData);
            }
            route.calcDataChangedCallback = (index, calcData) => {
                that.calcDataChangedCallback(routeId, index, calcData);
            }
            route.waypointClickedCallback = (index, x, y) => {
                that.waypointClickedCallback(routeId, index, x, y);
            }
        }
        route.setRouteData(data);
    }

    setWaypointData(routeId, index, waypointData) {
        this.routes.get(routeId).setWaypoint(index, waypointData);
    }

    removeRoute(routeId) {
        if (this.selectedRoute === routeId)
            this.selectedRoute = null;

        this.routes.get(routeId).clear();
        this.routes.delete(routeId);
    }

    removeWaypoint(routeId, index) {
        this.routes.get(routeId).removeWaypoint(index);
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

    setWaypointSelected(routeId, index, selected) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).setWaypointSelected(index, selected);
        if (selected)
            this.selectedRoute = routeId;
        else if (this.selectedRoute === routeId)
            this.selectedRoute = null;
    }

    selectedWaypointPosition() {
        if (!this.selectedRoute)
            return undefined;

        return this.routes.get(this.selectedRoute).selectedWaypointPosition();
    }
}
