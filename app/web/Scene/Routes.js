class RouteItem extends ComplexSign {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Interaction} interaction
     * @param {int} index
     */
    constructor(viewer, interaction, index) {
        super(viewer, interaction, "Assets/Images/wpt.svg", true, true, true);

        // Data
        this.index = index;
    }

    name() {
        return this.data.name + " " + (this.index + 1).toString();
    }
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
                that.routeItemChangedCallback(item.index, item.data);
            }
            item.clickedCallback = (x, y) => {
                that.routeItemClickedCallback(item.index, x, y);
            }

            // Add line
            if (this.items.length > 1)
                this._addLine(this.items[index - 1], this.items[index]);
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
            this.items[this.selectedIndex].setHighlighted(false);

        this.selectedIndex = -1;
    }

    selectItem(index) {
        this.selectedIndex = index;
        this.items[this.selectedIndex].setHighlighted(true);
    }

    selectedItemPosition() {
        if (this.selectedIndex > -1)
            return this.items[this.selectedIndex].selfPosition();

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
        for (var i = index; i < this.items.length; ++i) {
            this.items[i].index = i;
        }
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
