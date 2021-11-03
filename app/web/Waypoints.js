class Waypoint extends DraggablePoint {
    /**
     * @param {Cesium.Viewr} viewer
     * @param {JSON} waypointData
     * @param {Cesium.Color} color
     */
    constructor(viewer, waypointData) {
        super(viewer);

        // Callbacks
        this.changedCallback = null;

        // Data
        this.update(waypointData);

        // Visual
        this.normalScale = 1.0;
        this.hoveredScale = 1.2;

        var that = this;

        // SVG billboard with label
        this.point = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position; }, false),
            billboard: {
                image: "./icons/wpt.svg",
                color: new Cesium.CallbackProperty(() => {
                        if (!that.waypointData.confirmed)
                            return Cesium.Color.SANDYBROWN;
                        if (that.waypointData.current)
                            return Cesium.Color.FUCHSIA;
                        if (that.waypointData.reached)
                            return Cesium.Color.SILVER;
                        return Cesium.Color.WHITE;
                }, false),
                scale: this.normalScale,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
                text: new Cesium.CallbackProperty(() => { return that.waypointData.name; }, false),
                show: false,
                showBackground: true,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica",
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });

        // Dash line to the terrain
        this.pylon = this.viewer.entities.add({
             polyline: {
                 positions: new Cesium.CallbackProperty(() => {
                     return [that.position, that.terrainPosition];
                 }, false),
                 width: 1,
                 arcType: Cesium.ArcType.NONE,
                 material: new Cesium.PolylineDashMaterialProperty(Cesium.Color.GAINSBORO)
             }
        });

        // DraggablePoint point on the ground
        this.groundPoint = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.terrainPosition }, false),
            show: false,
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE
            }
        });
    }

    clear() {
        this.viewer.entities.remove(this.point);
        this.viewer.entities.remove(this.pylon);
        this.viewer.entities.remove(this.groundPoint);
    }

    /**
     * @param {JSON} waypointData - JSON, must contain latitude, longitude, altitude (AMSL)
     */
    update(waypointData) {
        this.waypointData = waypointData;
        this.waypointData.params.terrainAltitude = 0; // Don't trust terrain data
        this.changed = false;

        this.rebuild();
    }

    rebuild() {
        var params = this.waypointData.params;

        this.position = Cesium.Cartesian3.fromDegrees(params.longitude, params.latitude, params.altitude);
        this.terrainPosition = Cesium.Cartesian3.fromDegrees(params.longitude, params.latitude,
                                                             this.waypointData.params.terrainAltitude);

        // Sample terrain position from the ground
        var cartographic = Cesium.Cartographic.fromCartesian(this.terrainPosition);
        var that = this;
        var promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [cartographic]);
        Cesium.when(promise, updatedPositions => {
                        that.terrainPosition = Cesium.Cartographic.toCartesian(cartographic);
                        that.waypointData.params.terrainAltitude = cartographic.height;
                    });
    }

    setDragging(dragging) {
        super.setDragging(dragging);

        if (this.changed && this.changedCallback)
            this.changedCallback(this.waypointData);
    }

    // TODO: set hovered for terrain point and waypoint separatly
    setHovered(hovered) {
        this.groundPoint.point.pixelSize = hovered ? this.hoveredPointPixelSize : this.pointPixelSize;
    }

    checkMatch(objects) {
        var result = null;
        objects.forEach(object => {
            // check ground pointa
            if (this.groundPoint === object.id)
                 result = this.point;
        });
        return result;
    }

    onMove(cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        this.waypointData.params.latitude = Cesium.Math.toDegrees(cartographic.latitude);
        this.waypointData.params.longitude = Cesium.Math.toDegrees(cartographic.longitude);
        this.waypointData.params.terrainAltitude = cartographic.height;
        this.changed = true;
        this.rebuild();
    }

    onMoveShift(dx, dy) {
        this.waypointData.params.altitude += dy;
        this.changed = true;
        this.rebuild();
    }

    flyTo() {
        this.viewer.flyTo(this.point);
    }

    setEditMode(edit) {
        this.point.label.show = edit;
        this.groundPoint.show = edit;
    }
}
