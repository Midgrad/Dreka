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
        var baseName = this.data.name;
        if (this.index === 0)
            return baseName;

        return baseName + " " + (this.index).toString();
    }

    setEditMode(editMode) {
        for (const sign of this.signs) {
            sign.draggable = editMode;
        }
        this.normalColor = editMode ? Cesium.Color.YELLOW : Cesium.Color.WHITE;
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
        this.name = "";
        this.visible = true;
        this.editMode = false;
        this.highlightIndex = -1;

        // Entities
        this.items = [];
        this.lines = [];
    }

    clear() {
        var that = this;
        this.lines.forEach(line => that.viewer.entities.remove(line));
        this.lines = [];

        this.items.forEach(item => item.clear());
        this.items = [];
    }

    setRoute(routeData) {
        this.name = routeData.name;
        this.visible = routeData.visible;
        this.items.forEach(item => item.setVisible(this.visible));
    }

    setRouteItem(index, data) {
        if (this.items.length > index) {
            this.items[index].update(data);
        } else if (this.items.length === index) {
            var item = new RouteItem(this.viewer, this.interaction, index);
            item.update(data);
            item.setEditMode(this.editMode);
            item.setVisible(this.visible);
            this.items.push(item);

            // Callbacks
            var that = this;
            item.changedCallback = () => { that.routeItemChangedCallback(item.index, item.data); }
            item.clickedCallback = (x, y) => { that.routeItemClickedCallback(item.index, x, y); }

            // Add line
            for (var prevIndex = index - 1; prevIndex > -1; --prevIndex)
            {
                if (this.items[prevIndex].hasPosition() &&
                    this.items[index].hasPosition()) {
                    this._addLine(this.items[prevIndex], this.items[index]);
                    break;
                }
            }
        } else {
            console.warn("Wrong wpt index in setRouteItem")
        }
    }

    setEditMode(editMode) {
        this.editMode = editMode;
        this.items.forEach(item => item.setEditMode(editMode));
    }

    highlightItem(index) {
        if (this.highlightIndex === index)
            return;

        if (this.highlightIndex >= 0 && this.highlightIndex < this.items.length)
            this.items[this.highlightIndex].setHighlighted(false);

        this.highlightIndex = index;

        if (this.highlightIndex >= 0 && this.highlightIndex < this.items.length)
            this.items[this.highlightIndex].setHighlighted(true);
    }

    removeItem(index) {
        var removeIndex = index < this.lines.length ? index : index - 1;
        var updateIndex = removeIndex - 1;

        // Remove item entity
        this.items[index].clear();
        this.items.splice(index, 1);

        // Remove one line
        this.viewer.entities.remove(this.lines[removeIndex]);
        this.lines.splice(removeIndex, 1);

        // FIXME: Update 2 other lines
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

        if (index < this.highlightIndex)
            this.highlightIndex--;
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
                show: new Cesium.CallbackProperty(() => { return that.visible; }, false),
                positions: new Cesium.CallbackProperty(() => { return [first.position,
                                                                       second.position]; }, false),
                arcType: Cesium.ArcType.GEODESIC,
                material: new Cesium.PolylineArrowMaterialProperty(new Cesium.CallbackProperty(() => {
                    return that.editMode ? Cesium.Color.YELLOW : Cesium.Color.WHITE;
                })),
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
        this.selectedMission = null;
    }

    clear() {
        this.routes.forEach(route => { route.clear(); } );
        this.routes.clear();
    }

    setRoute(routeId, data) {
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
        route.setRoute(data);
    }

    setRouteItem(routeId, index, data) {
        this.routes.get(routeId).setRouteItem(index, data);
    }

    removeRoute(routeId) {
        if (this.selectedMission === routeId)
            this.selectedMission = null;

        this.routes.get(routeId).clear();
        this.routes.delete(routeId);
    }

    removeRouteItem(routeId, index) {
        this.routes.get(routeId).removeItem(index);
    }

    selectRoute(routeId) {
        if (this.selectedMission === routeId)
            return;

        var route = this.routes.has(this.selectedMission) ? this.routes.get(this.selectedMission) : null;
        if (route) {
            route.setEditMode(false);
            route.highlightItem(-1);
        }

        this.selectedMission = routeId;

        route = this.routes.has(routeId) ? this.routes.get(routeId) : null;
        if (route) {
            route.setEditMode(true);
        }
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

    highlightItem(index) {
        if (!this.routes.has(this.selectedMission))
            return;

        this.routes.get(this.selectedMission).highlightItem(index);
    }
}
