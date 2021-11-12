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
        this.editMode = false;
        this.update(waypointData);

        // Visual
        this.normalScale = 1.0;
        this.hoveredScale = 1.5;

        var that = this;

        var radiusCallback = new Cesium.CallbackProperty(() => {
            var params = that.waypointData.params;
            return params && params.accept_radius ? params.accept_radius : 0;
        }, false);

        // SVG billboard with label and accept radius
        this.point = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position; }, false),
            billboard: {
                show: new Cesium.CallbackProperty(() => { return that.validPosition; }, false),
                image: "./signs/wpt.svg",
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
                text: new Cesium.CallbackProperty(() => {
                    return that.waypointData.name + " " + (that.index + 1); }, false),
                show: new Cesium.CallbackProperty(() => { return that.validPosition && that.editMode; }, false),
                showBackground: true,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica",
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            ellipse: {
                semiMinorAxis: radiusCallback,
                semiMajorAxis: radiusCallback,
                height: new Cesium.CallbackProperty(() => { return that.waypointData.altitude; }, false),
                material: Cesium.Color.CADETBLUE.withAlpha(0.5),
                //outline: true,
            }
        });

        // Dash line to the terrain
        this.pylon = this.viewer.entities.add({
             polyline: {
                 show: new Cesium.CallbackProperty(() => { return that.validPosition }, false),
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
            point: {
                show: new Cesium.CallbackProperty(() => { return that.validPosition && that.editMode; }, false),
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
        this.terrainAltitude = 0; // Don't trust terrain data
        this.changed = false;

        this.rebuild();
    }

    rebuild() {
        var latitude = this.waypointData.latitude;
        var longitude = this.waypointData.longitude;
        var altitude = this.waypointData.altitude;

        if (Cesium.defined(latitude) && Cesium.defined(longitude) && Cesium.defined(altitude)) {

            this.validPosition = latitude !== null && longitude !== null && altitude !== null;
            this.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
            this.terrainPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude,
                                                                 this.terrainAltitude);
        } else {
            this.validPosition = false;
            this.position = Cesium.Cartesian3.ZERO;
            this.terrainPosition = Cesium.Cartesian3.ZERO;
        }

        if (!this.validPosition)
            return;
        // Sample terrain position from the ground
        var cartographic = Cesium.Cartographic.fromCartesian(this.terrainPosition);
        var that = this;
        var promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [cartographic]);
        Cesium.when(promise, updatedPositions => {
                        that.terrainPosition = Cesium.Cartographic.toCartesian(cartographic);
                        that.terrainAltitude = cartographic.height;
                    });
    }

    setDragging(dragging) {
        super.setDragging(dragging);

        if (this.changed && this.changedCallback)
            this.changedCallback(this.waypointData);
    }

    // Ground point hover
    setHovered(hovered) {
        this.groundPoint.point.pixelSize = hovered ? this.hoveredPointPixelSize : this.pointPixelSize;
    }

    // Waypoint hover
    setHoveredPoint(hovered) {
        this.point.billboard.scale = hovered ? this.hoveredScale : this.normalScale;
    }

    onPick(pickedObjects) {
        var picked = null;
        var hover = false;

        // Pick ground point first
        pickedObjects.forEach(object => {
            if (this.groundPoint === object.id)
                picked = this.groundPoint;
        });

        // Hover if we picked
        hover = picked;

        // Pick waypoint next
        pickedObjects.forEach(object => {
            if (this.point === object.id)
                picked = this.point;
        });

        this.setHoveredPoint(picked);

        return hover;
    }

    checkMatchPoint(objects) {
        var result = null;
        objects.forEach(object => { if (this.point === object.id) result = this.point; });
        return result;
    }

    checkMatchGroundPoint(objects) {
        var result = null;
        objects.forEach(object => { if (this.groundPoint === object.id) result = this.groundPoint; });
        return result;
    }

    onMove(cartesian) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        this.waypointData.latitude = Cesium.Math.toDegrees(cartographic.latitude);
        this.waypointData.longitude = Cesium.Math.toDegrees(cartographic.longitude);
        this.terrainAltitude = cartographic.height;
        this.changed = true;
        this.rebuild();
    }

    onMoveShift(dx, dy) {
        this.waypointData.altitude += dy;
        this.changed = true;
        this.rebuild();
    }

    flyTo() { this.viewer.flyTo(this.point); }

    setEditMode(edit) { this.editMode = edit; }
}
