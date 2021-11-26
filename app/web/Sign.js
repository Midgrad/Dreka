class Sign extends Draggable {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Input} input
     * @param {JSON} data
     * @param {int} index
     */
    constructor(viewer, input, sign, data) {
        super(viewer, input);

        // Callbacks
        this.changedCallback = null;
        this.clickedCallback = null;

        // Data
        this.validPosition = false;
        this.position = Cesium.Cartesian3.ZERO;
        this.terrainPosition = Cesium.Cartesian3.ZERO;
        this.editMode = false;
        this.selected = false;
        this.hoveredPoint = false;
        this.hoveredLoiter = false;

        // SVG billboard with label and accept radius
        var that = this;
        this.point = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position; }, false),
            billboard: {
                image: sign,
                scale: new Cesium.CallbackProperty(() => {
                    return (that.selected || that.hoveredPoint) ? 1.5 : 1.0;
                }, false),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
                showBackground: true,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica",
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
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

        this.update(data);
    }

    clear() {
        var that = this;
        this.viewer.entities.remove(this.point);
        this.viewer.entities.remove(this.pylon);
        this.viewer.entities.remove(this.loiter);
    }

    /**
     * @param {JSON} data - JSON, must contain latitude, longitude, altitude (AMSL)
     */
    update(data) {
        this.data = data;
        this.terrainAltitude = 0; // Don't trust terrain data
        this.changed = false;

        this._rebuild();
    }

    _rebuild() {
        var params = this.data.params;
        var latitude = params ? params.latitude : undefined;
        var longitude = params ? params.longitude : undefined;
        var altitude = params ? params.altitude : undefined;

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

        this.point.label.show = this.validPosition && this.editMode && !this.selected;
        this.point.label.text = this.data.name + " " + (this.index + 1);

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

    setSelected(selected) {
        this.selected = selected;
        this.point.label.show = this.validPosition && this.editMode && !this.selected;
    }

    onClick(event, unusedCartesian, modifier) {
        if (Cesium.defined(modifier) || !Cesium.defined(this.clickedCallback))
            return false;

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
            if (this.changed && this.changedCallback)
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
                this.data.params.latitude = Cesium.Math.toDegrees(newCartographic.latitude);
                this.data.params.longitude = Cesium.Math.toDegrees(newCartographic.longitude);
            }
            this.data.params.altitude = newCartographic.height;
            changed = true;
        }
        else if (this.hoveredLoiter) {
            var distance = Cesium.Cartesian3.distance(newCartesian, this.position);
            var params = this.data.params;

            // Modify loiter radius
            if (!Cesium.defined(params.radius))
                return false;

            this.data.params.radius = distance;
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
        var cartesian = Cesium.Cartesian3.fromDegrees(this.data.params.longitude,
                                                      this.data.params.latitude,
                                                      this.data.params.altitude);
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian);
    }
}
