class Sign extends Draggable {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Input} input
     * @param {URL} sign - url to svg icon
     */
    constructor(viewer, input, sign) {
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

        // SVG billboard with label
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
                 material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.WHITE),
                 width: 4.0
             }
        });
    }

    clear() {
        this.viewer.entities.remove(this.point);
        this.viewer.entities.remove(this.pylon);
    }

    /**
     * @param {JSON} data - JSON, must contain latitude, longitude, altitude (AMSL)
     */
    update(data) {
        this.data = data;
        this.terrainAltitude = 0; // Don't trust terrain data
        this.changed = false;

        this.rebuild();
    }

    rebuild() {
        var position = this.data.position;
        var latitude = position ? position.latitude : undefined;
        var longitude = position ? position.longitude : undefined;
        var altitude = position ? position.altitude : undefined;

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
        this.point.billboard.color = this.data.current ? Cesium.Color.MAGENTA :
                                        this.data.reached ? Cesium.Color.AQUAMARINE : Cesium.Color.WHITE

        this.point.label.show = this.validPosition && this.editMode && !this.selected;
        this.point.label.text = this.data.name;
    }

    setEditMode(edit) {
        this.editMode = edit;
        this.rebuild();
    }

    setSelected(selected) {
        this.selected = selected;
        this.point.label.show = this.validPosition && this.editMode && !this.selected;
    }

    onClick(event, unusedCartesian, modifier) {
        if (Cesium.defined(modifier) || !Cesium.defined(this.clickedCallback))
            return false;

        if (this.hoveredPoint) {
            var screenPosition = this.itemPosition();
            this.clickedCallback(screenPosition ? screenPosition.x : event.position.x,
                                 screenPosition ? screenPosition.y : event.position.y);
            return true;
        }
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
        if (this.hovered()) {
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

        this.changed = this.onDrag(newCartesian, modifier);
        if (this.changed)
            this.rebuild();

        return this.changed;
    }

    onDrag(newCartesian, modifier) {
        if (this.hoveredPoint) {
            var newCartographic = Cesium.Cartographic.fromCartesian(newCartesian);
            // Modify only altitude if SHIFT
            if (modifier !== Cesium.KeyboardEventModifier.SHIFT) {
                this.data.position.latitude = Cesium.Math.toDegrees(newCartographic.latitude);
                this.data.position.longitude = Cesium.Math.toDegrees(newCartographic.longitude);
            }
            this.data.position.altitude = newCartographic.height;
            return true;
        }
        return false;
    }

    onPick(objects) {
        if (!this.editMode)
            return false;

        // Pick waypoints first
        this.hoveredPoint = objects.find(object => { return object.id === this.point });
        return this.hoveredPoint;
    }

    hovered() { return this.hoveredPoint; }

    flyTo() { this.viewer.flyTo(this.point); }

    itemPosition() {
        var scene = this.viewer.scene;
        var cartesian = Cesium.Cartesian3.fromDegrees(this.data.position.longitude,
                                                      this.data.position.latitude,
                                                      this.data.position.altitude);
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian);
    }
}

class LoiterSign extends Sign {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Input} input
     * @param {JSON} data
     */
    constructor(viewer, input, sign) {
        super(viewer, input, sign);

        // Data
        this.hoveredLoiter = false;

        var that = this;
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
    }

    clear() {
        super.clear();
        this.viewer.entities.remove(this.loiter);
    }

    rebuild() {
        super.rebuild();

        var params = this.data.params;
        var position = this.data.position;
        var loiterRadius = params && params.radius ? params.radius : 0;
        this.loiter.ellipse.show = loiterRadius > 0 && this.validPosition;
        this.loiter.ellipse.semiMinorAxis = loiterRadius;
        this.loiter.ellipse.semiMajorAxis = loiterRadius;
        this.loiter.ellipse.height = position && position.altitude ? position.altitude : 0;
        // TODO: clockwise
    }

    onClick(event, unusedCartesian, modifier) {
        // TODO: Click on loiter to change clockwise
        return super.onClick(event, unusedCartesian, modifier);
    }

    onDrag(newCartesian, modifier) {
        if (super.onDrag(newCartesian, modifier))
            return true;

        if (this.hoveredLoiter) {
            var distance = Cesium.Cartesian3.distance(newCartesian, this.position);
            var params = this.data.params;

            // Modify loiter radius
            if (!Cesium.defined(params.radius))
                return false;

            this.data.params.radius = distance;
            return true;
        }
        return false;
    }

    onPick(objects) {
        if (!this.editMode)
            return false;

        if (super.onPick(objects))
            return true;

        // Pick loiter
        this.hoveredLoiter = objects.find(object => { return object.id === this.loiter });
        return this.hoveredLoiter;
    }

    hovered() { return super.hovered() || this.hoveredLoiter; }
}
