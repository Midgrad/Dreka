class RouteItem extends LoiterSign {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Input} input
     * @param {int} index
     */
    constructor(viewer, input, index) {
        super(viewer, input, "./signs/wpt.svg");

        // Data
        this.index = index;
        this.hoveredAccept = false;

        // Accept radius
        var that = this;
        this.accept = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position; }, false),
            ellipse: {
                material: Cesium.Color.CADETBLUE.withAlpha(0.5),
                outline: true,
                outlineWidth: new Cesium.CallbackProperty(() => {
                    return that.hoveredAccept ? 3.0 : 2.0;
                }, false),
                outlineColor: Cesium.Color.CADETBLUE.withAlpha(0.5)
            }
        });
    }

    clear() {
        super.clear();
        this.viewer.entities.remove(this.accept);
    }

    rebuild() {
        super.rebuild()

        var params = this.data.params;
        var position = this.data.position;
        var acceptRadius = params && params.accept_radius ? params.accept_radius : 0;
        this.accept.ellipse.show = acceptRadius > 0 && this.validPosition;
        this.accept.ellipse.semiMinorAxis = acceptRadius;
        this.accept.ellipse.semiMajorAxis = acceptRadius;
        this.accept.ellipse.height = position && position.altitude ? position.altitude : 0;

        // TODO: confirmed, reached
    }

    onDrag(newCartesian, modifier) {
        if (super.onDrag(newCartesian, modifier))
            return true;


        if (this.hoveredAccept) {
            var distance = Cesium.Cartesian3.distance(newCartesian, this.position);
            var params = this.data.params;

            // Modify accept radius
            if (!Cesium.defined(params.accept_radius))
                return false;

            this.data.params.accept_radius = distance;
            return true;
        }
        return false;
    }

    onPick(objects) {
        if (!this.editMode)
            return false;

        if (super.onPick(objects))
            return true;

        // Pick accept
        this.hoveredAccept = objects.find(object => { return object.id === this.accept });
        return this.hoveredAccept;
    }

    hovered() { return super.hovered() || this.hoveredAccept; }
}

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

    setWaypoint(index, data) {
        // TODO: relative latitude
        if (this.waypoints.length > index) {
            this.waypoints[index].update(data);
        } else if (this.waypoints.length === index) {
            var waypoint = new RouteItem(this.viewer, this.input, index);
            waypoint.update(data);
            waypoint.setEditMode(this.editMode);
            this.waypoints.push(waypoint);

            // Callbacks
            var that = this;
            waypoint.changedCallback = () => {
                // Update calculated data for changed and next wpt
                that._updateCalcData(waypoint);
                if (that.waypoints.length > waypoint.index + 1)
                    that._updateCalcData(this.waypoints[index + 1]);

                that.waypointChangedCallback(waypoint.index, waypoint.data);
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
        this.waypoints[index].setSelected(selected);

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
            this.waypoints[index].setSelected(false);
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
        var calcData = waypoint.data.calcData;

        var distance = index > 0 ? Cesium.Cartesian3.distance(
                                      waypoint.position, this.waypoints[index - 1].position) :
                                      undefined;
        calcData.distance = distance;

        waypoint.data.calcData = calcData;
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
            route.waypointChangedCallback = (index, data) => {
                that.waypointChangedCallback(routeId, index, data);
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

    setWaypointData(routeId, index, data) {
        this.routes.get(routeId).setWaypoint(index, data);
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
