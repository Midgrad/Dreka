class Waypoint extends DraggablePoint {
    /**
     * @param {Cesium.Viewer} viewer
     * @param {JSON} waypointData
     * @param {int} index
     */
    constructor(viewer, waypointData, index) {
        super(viewer);

        // Callbacks
        this.changedCallback = null;
        this.clickedCallback = null;

        // Data
        this.index = index;
        this.validPosition = false;
        this.position = Cesium.Cartesian3.ZERO;
        this.terrainPosition = Cesium.Cartesian3.ZERO;
        this.editMode = false;

        // Visual
        this.normalScale = 1.0;
        this.hoveredScale = 1.5;

        var that = this;

        // SVG billboard with label and accept radius
        this.point = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position; }, false),
            billboard: {
                image: "./signs/wpt.svg",
                scale: this.normalScale,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
                showBackground: true,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica",
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            ellipse: {
                material: Cesium.Color.CADETBLUE.withAlpha(0.5),
            }
        });

        // Dash line to the terrain
        this.pylon = this.viewer.entities.add({
             polyline: {
                 positions: new Cesium.CallbackProperty(() => {
                     return [that.position, that.terrainPosition];
                 }, false),
                 arcType: Cesium.ArcType.NONE,
                 material: new Cesium.PolylineDashMaterialProperty(Cesium.Color.GAINSBORO),
                 width: 1
             }
        });

        // Circle for loiters
        this.loiter = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position; }, false),
            ellipse: {
                fill: false,
                outline: true,
                outlineWidth: 2,
                outlineColor: Cesium.Color.WHITE
            }
        });
        this.loiterArrows = [];

        // DraggablePoint point on the ground with loiter shadow
        this.groundPoint = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.terrainPosition }, false),
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE
            },
            ellipse: {
                fill: false,
                outline: true,
                outlineWidth: 1,
                outlineColor: Cesium.Color.SLATEGRAY
            }
        });

        this.update(waypointData);
    }

    clear() {
        var that = this;
        this.viewer.entities.remove(this.point);
        this.viewer.entities.remove(this.pylon);
        this.viewer.entities.remove(this.groundPoint);
        this.viewer.entities.remove(this.loiter);
        this.loiterArrows.forEach(arrow => that.viewer.entities.remove(arrow));
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
        var params = this.waypointData.params;

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

        if (this.validPosition) {
            // Sample terrain position from the ground
            var cartographic = Cesium.Cartographic.fromCartesian(this.terrainPosition);
            var that = this;
            var promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [cartographic]);
            Cesium.when(promise, updatedPositions => {
                            that.terrainPosition = Cesium.Cartographic.toCartesian(cartographic);
                            that.terrainAltitude = cartographic.height;
                            that.pylon.polyline.show = true;
                            that.groundPoint.point.show = that.editMode;
                            this.groundPoint.ellipse.height = that.terrainAltitude;
                        });
        } else {
            this.pylon.polyline.show = false;
            this.groundPoint.point.show = false;
        }

        this.point.billboard.show = this.validPosition;
        this.point.billboard.color = this.waypointData.current ? Cesium.Color.FUCHSIA : Cesium.Color.WHITE;

        this.point.label.show = this.validPosition && this.editMode;
        this.point.label.text = this.waypointData.name + " " + (this.index + 1);

        var acceptRadius = params && params.accept_radius ? params.accept_radius : 0;
        this.point.ellipse.show = acceptRadius > 0 && this.validPosition;
        this.point.ellipse.semiMinorAxis = acceptRadius;
        this.point.ellipse.semiMajorAxis = acceptRadius;
        this.point.ellipse.height = altitude;
        // TODO: confirmed, reached

        var loiterRadius = params && params.radius ? params.radius : 0;
        this.loiter.ellipse.show = loiterRadius > 0 && this.validPosition;
        this.loiter.ellipse.semiMinorAxis = loiterRadius;
        this.loiter.ellipse.semiMajorAxis = loiterRadius;
        this.loiter.ellipse.height = altitude;

        this.groundPoint.ellipse.show = loiterRadius > 0 && this.validPosition;
        this.groundPoint.ellipse.semiMinorAxis = loiterRadius;
        this.groundPoint.ellipse.semiMajorAxis = loiterRadius;

        this.loiterArrows.forEach(arrow => that.viewer.entities.remove(arrow));

        var clockwise = params ? params.clockwise : undifined;
        if (loiterRadius > 0 && Cesium.defined(clockwise) && this.validPosition) {
            for (var angle = 0; angle < Cesium.Math.TWO_PI; angle += Cesium.Math.PI_OVER_FOUR) {
                var arrow = this.viewer.entities.add({
                    position: projectPoint(Cesium.Math.toRadians(latitude),
                                           Cesium.Math.toRadians(longitude),
                                           altitude, angle, loiterRadius),
                    billboard: {
                        image: "./signs/arw.svg",
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        alignedAxis: Cesium.Cartesian3.UNIT_Z,
                        rotation: -angle + (clockwise ? -Cesium.Math.PI_OVER_TWO :
                                                         Cesium.Math.PI_OVER_TWO),
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0,
                                                                                  loiterRadius * 15)
                    }
                });
                this.loiterArrows.push(arrow);
            }
        }
    }

    setEditMode(edit) {
        this.editMode = edit;
        this.rebuild();
    }

    setDragging(dragging) {
        super.setDragging(dragging);

        if (this.changed)
            this.changedCallback(this.waypointData);
    }

    // Ground point hover
    setHovered(hovered) {
        this.groundPoint.point.pixelSize = hovered ? this.hoveredPointPixelSize : this.pointPixelSize;
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

        // Waypoint hover
        this.point.billboard.scale = picked ? this.hoveredScale : this.normalScale;

        // Pick loiter next
        picked = null;
        pickedObjects.forEach(object => {
            if (this.loiter === object.id)
                picked = this.loiter;
        });

        // Loiter hover
        this.loiter.ellipse.outlineWidth = picked ? 4 : 2;

        return hover;
    }

    onClick(cartesian, x, y, objects) {
        // TODO: remove objects from onClick, use hovered
        // Click on waypoint
        var result = null;
        objects.forEach(object => { if (this.point === object.id) result = this.point; });
        if (result)
            this.clickedCallback(x, y);

         // Click on loiter
        result = null;
        var params = this.waypointData.params;
        var clockwise = params ? params.clockwise : undifined;
        objects.forEach(object => { if (this.loiter === object.id) result = this.loiter; });
        if (result && Cesium.defined(clockwise)) {
            this.waypointData.params.clockwise = !clockwise;
            this.changedCallback(this.waypointData);
        }
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

        // Modify altitude
        this.waypointData.altitude += dy;

        var params = this.waypointData.params;
        // Modify waypoint accept radius
        var acceptRadius = params ? params.accept_radius : undefined;
        if (Cesium.defined(acceptRadius))
            this.waypointData.params.accept_radius = acceptRadius + dx;

        // Modify loiter radius
        var loiterRadius = params ? params.radius : undefined;
        if (Cesium.defined(loiterRadius))
            this.waypointData.params.radius = loiterRadius + dx;

        this.changed = true;
        this.rebuild();
    }

    flyTo() { this.viewer.flyTo(this.point); }
}
