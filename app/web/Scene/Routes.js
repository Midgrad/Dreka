class RouteItem extends LoiterSign {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Interaction} interaction
     * @param {int} index
     */
    constructor(viewer, interaction, index) {
        super(viewer, interaction, "Assets/Images/wpt.svg");

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

        this.point.label.text = this.data.name + " " + (this.index + 1).toString();

        // TODO: confirmed, reached
    }

//    _onDrag(newCartesian, modifier) {
//        if (super._onDrag(newCartesian, modifier))
//            return true;


//        if (this.hoveredAccept) {
//            var distance = Cesium.Cartesian3.distance(newCartesian, this.position);
//            var params = this.data.params;

//            // Modify accept radius
//            if (!Cesium.defined(params.accept_radius))
//                return false;

//            this.data.params.accept_radius = distance;
//            return true;
//        }
//        return false;
//    }

//    matchPicking(objects) {
//        if (!this.editMode)
//            return false;

//        if (super.matchPicking(objects))
//            return true;

//        // Pick accept
//        this.hoveredAccept = objects.find(object => { return object.id === this.accept });
//        return this.hoveredAccept;
//    }

//    hovered() { return super.hovered() || this.hoveredAccept; }
}

class Route {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Interaction} interaction
     */
    constructor(viewer, interaction) {
        this.viewer = viewer;
        this.interaction = interaction;

        // Callbacks
        this.routeItemChangedCallback = null;
        this.updateCalcDataCallback = null;
        this.routeItemClickedCallback = null;

        // Data
        this.editMode = false;
        this.selectedIndex = -1;

        // Entities
        this.items = [];
        // Nominal track
        this.lines = [];
    }

    clear() {
        var that = this;
        this.lines.forEach(line => that.viewer.entities.remove(line));
        this.lines = [];

        this.items.forEach(item => item.clear());
        this.items = [];
    }

    setRouteData(routeData) {
        //this.visible = routeData.visible;
        this.name = routeData.name;
    }

    setRouteItem(index, data) {
        if (this.items.length > index) {
            this.items[index].update(data);
        } else if (this.items.length === index) {
            var item = new RouteItem(this.viewer, this.interaction, index);
            item.update(data);
            item.setEnabled(this.editMode);
            this.items.push(item);

            // Callbacks
            var that = this;
            item.changedCallback = () => {
                // Update calculated data for changed and next wpt
                that._updateDistanceCalcData(item);
                if (that.items.length > item.index + 1)
                    that._updateDistanceCalcData(this.items[index + 1]);

                that.routeItemChangedCallback(item.index, item.data);
            }
            item.clickedCallback = (x, y) => {
                that.routeItemClickedCallback(item.index, x, y);
            }
            item.terrainCallback = (terrainAltitude) => {
                that.updateCalcDataCallback(item.index, "terrainAltitude", terrainAltitude);
            }

            // Add line
            if (this.items.length > 1)
                this._addLine(this.items[index - 1], this.items[index]);

            this._updateDistanceCalcData(item);
        } else {
            console.warn("`Wrong wpt index in setRouteItem")
        }
    }

    setEnabled(editMode) {
        this.editMode = editMode;
        this.items.forEach(item => item.setEnabled(editMode));
    }

    deselectItem() {
        if (this.selectedIndex > -1)
            this.items[this.selectedIndex].setSelected(false);

        this.selectedIndex = -1;
    }

    selectItem(index) {
        this.selectedIndex = index;
        this.items[this.selectedIndex].setSelected(true);
    }

    selectedItemPosition() {
        if (this.selectedIndex > -1)
            return this.items[this.selectedIndex].itemPosition();

        return undefined;
    }

    removeRouteItem(index) {
        if (this.selectedIndex === index)
            this.deselectItem();

        var removeIndex = index < this.lines.length ? index : index - 1;
        var updateIndex = removeIndex - 1;

        // Remove item entity
        this.items[index].clear();
        this.items.splice(index, 1);

        // Remove one line
        this.viewer.entities.remove(this.lines[removeIndex]);
        this.lines.splice(removeIndex, 1);

        // Update another line
        if (updateIndex > -1) {
            var left = this.items[updateIndex];
            var right = this.items[updateIndex + 1];
            this.lines[updateIndex].polyline.positions = new Cesium.CallbackProperty(() => {
                return [left.position, right.position];
            }, false);
            this.lines[updateIndex].polyline.show =  new Cesium.CallbackProperty(() => {
                return left.validPosition && right.validPosition;
            }, false);
        }

        // Update indices
        for (var i = index; i < this.items.length; ++i)
            this.items[i].index = i;
    }

    center() {
        this.viewer.flyTo(this.lines);
    }

    centerRouteItem(index) {
        this.items[index].flyTo();
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

    _updateDistanceCalcData(item) {
        var index = item.index;
        var distance = index > 0 ? Cesium.Cartesian3.distance(
                                      item.position, this.items[index - 1].position) : 0;
        this.updateCalcDataCallback(index, "distance", distance);
    }
}

class Routes {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Interaction} interaction
     */
    constructor(viewer, interaction) {
        this.viewer = viewer;
        this.interaction = interaction;

        // Callbacks
        this.routeItemChangedCallback = null;
        this.updateCalcDataCallback = null;
        this.routeItemClickedCallback = null;

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
            this.editingRoute.setEnabled(false);

        this.editingRoute = route;

        if (this.editingRoute)
            this.editingRoute.setEnabled(true);
    }

    setRouteData(routeId, data) {
        var route;
        if (this.routes.has(routeId)) {
            route = this.routes.get(routeId);
        } else {
            route = new Route(this.viewer, this.interaction)
            this.routes.set(routeId, route);

            var that = this;
            route.routeItemChangedCallback = (index, data) => {
                that.routeItemChangedCallback(routeId, index, data);
            }
            route.updateCalcDataCallback = (index, key, value) => {
                that.updateCalcDataCallback(routeId, index, key, value);
            }
            route.routeItemClickedCallback = (index, x, y) => {
                that.routeItemClickedCallback(routeId, index, x, y);
            }
        }
        route.setRouteData(data);
    }

    setRouteItemData(routeId, index, data) {
        this.routes.get(routeId).setRouteItem(index, data);
    }

    removeRoute(routeId) {
        if (this.selectedRoute === routeId)
            this.selectedRoute = null;

        this.routes.get(routeId).clear();
        this.routes.delete(routeId);
    }

    removeRouteItem(routeId, index) {
        this.routes.get(routeId).removeRouteItem(index);
    }

    centerRoute(routeId) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).center();
    }

    centerRouteItem(routeId, index) {
        if (!this.routes.has(routeId))
            return;

        this.routes.get(routeId).centerRouteItem(index);
    }

    setItemSelected(routeId, index) {
        if (this.selectedRoute)
            this.selectedRoute.deselectItem();

        this.selectedRoute = this.routes.has(routeId) ? this.routes.get(routeId) : null;

        if (this.selectedRoute)
            this.selectedRoute.selectItem(index);
    }

    selectedItemPosition() {
        if (!this.selectedRoute)
            return undefined;

        return this.selectedRoute.selectedItemPosition();
    }
}
