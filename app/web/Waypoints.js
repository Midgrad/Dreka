class Waypoint extends Draggable {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Input} input
     * @param {JSON} waypointData
     * @param {int} index
     */
    constructor(viewer, input, waypointData, index) {
        super(viewer, input);

        // Callbacks
        this.changedCallback = null;
        this.clickedCallback = null;

        // Data
        this.index = index;
        this.validPosition = false;
        this.position = Cesium.Cartesian3.ZERO;
        this.terrainPosition = Cesium.Cartesian3.ZERO;
        this.editMode = false;
        this.waypointSelected = false;
        this.hoveredPoint = false;
        this.hoveredLoiter = false;

        // SVG billboard with label and accept radius
        var that = this;
        this.point = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position; }, false),
            billboard: {
                image: "./signs/wpt.svg",
                scale: new Cesium.CallbackProperty(() => {
                    return (that.waypointSelected || that.hoveredPoint) ? 1.5 : 1.0;
                }, false),
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
                outlineWidth: new Cesium.CallbackProperty(() => {
                    return that.hoveredLoiter ? 3.0 : 2.0;
                }, false),
                outlineColor: Cesium.Color.WHITE
            }
        });
        // TODO: show loiter direction

        this.update(waypointData);
    }

    clear() {
        var that = this;
        this.viewer.entities.remove(this.point);
        this.viewer.entities.remove(this.pylon);
        this.viewer.entities.remove(this.loiter);
    }

    /**
     * @param {JSON} waypointData - JSON, must contain latitude, longitude, altitude (AMSL)
     */
    update(waypointData) {
        this.waypointData = waypointData;
        this.terrainAltitude = 0; // Don't trust terrain data
        this.changed = false;

        this._rebuild();
    }

    _rebuild() {
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
                        });
        } else {
            this.pylon.polyline.show = false;
        }

        this.point.billboard.show = this.validPosition;
        this.point.billboard.color = this.waypointData.current ? Cesium.Color.FUCHSIA : Cesium.Color.WHITE;

        this.point.label.show = this.validPosition && this.editMode && !this.waypointSelected;
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
        // TODO: clockwise
    }

    setEditMode(edit) {
        this.editMode = edit;
        this._rebuild();
    }

    setWaypointSelected(selected) {
        this.waypointSelected = selected;
        this.point.label.show = this.validPosition && this.editMode && !this.waypointSelected;
    }

    onClick(event, unusedCartesian, modifier) {
        if (Cesium.defined(modifier))
            return;

        if (this.hoveredPoint) {
            var screenPosition = this.waypointPosition();
            this.clickedCallback(screenPosition ? screenPosition.x : event.position.x,
                                 screenPosition ? screenPosition.y : event.position.y);
            return true;
        }
        // TODO: Click on loiter to change clockwise
        return false;
    }

    onUp(event, cartesian, modifier) {
        if (this.dragging) {
            this.setDragging(false);
            if (this.changed)
                this.changedCallback();
            return true;
        }

        return false;
    }

    onDown(event, cartesian, modifier) {
        if (this.hoveredPoint || this.hoveredLoiter) {
            this.setDragging(true);
            return true;
        }

        return false;
    }

    onMove(event, badCartesian, modifier) {
        if (!this.dragging)
            return false;

        var scene = this.viewer.scene;
        var camera = scene.camera;
        var cartesian = this.position;

        // Normal by camera if any modifier else normal by surface
        var normal = Cesium.defined(modifier) ?
            Cesium.Cartesian3.subtract(scene.camera.position, cartesian, new Cesium.Cartesian3()) :
            scene.globe.ellipsoid.geodeticSurfaceNormal(cartesian);

        if (!Cesium.defined(normal))
            return false;

        normal = Cesium.Cartesian3.normalize(normal, normal);

        var ray = this.viewer.scene.camera.getPickRay(event.endPosition);
        var plane = Cesium.Plane.fromPointNormal(cartesian, normal);
        var newCartesian = Cesium.IntersectionTests.rayPlane(ray, plane);
        var changed = false;

        if (this.hoveredPoint) {
            // this.position = newCartesian;
            var newCartographic = Cesium.Cartographic.fromCartesian(newCartesian);
            // Modify only altitude if SHIFT
            if (modifier !== Cesium.KeyboardEventModifier.SHIFT) {
                this.waypointData.latitude = Cesium.Math.toDegrees(newCartographic.latitude);
                this.waypointData.longitude = Cesium.Math.toDegrees(newCartographic.longitude);
            }
            this.waypointData.altitude = newCartographic.height;
            changed = true;
        }
        else if (this.hoveredLoiter) {
            var distance = Cesium.Cartesian3.distance(newCartesian, this.position);
            var params = this.waypointData.params;

            // Modify loiter radius
            if (!Cesium.defined(params.radius))
                return false;

            this.waypointData.params.radius = distance;
            changed = true;
        }

        this.changed = changed;
        if (changed)
            this._rebuild();

        return changed;
    }

    onPick(objects) {
        if (!this.editMode)
            return false;

        // Pick waypoints first
        this.hoveredPoint = objects.find(object => { return object.id === this.point });
        if (this.hoveredPoint)
            return true;

        // Pick loiter next
        this.hoveredLoiter = objects.find(object => { return object.id === this.loiter });
        if (this.hoveredLoiter)
            return true;

        return false;
    }

    flyTo() { this.viewer.flyTo(this.point); }

    waypointPosition() {
        var scene = this.viewer.scene;
        var cartesian = Cesium.Cartesian3.fromDegrees(this.waypointData.longitude,
                                                      this.waypointData.latitude,
                                                      this.waypointData.altitude);
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian);
    }
}
