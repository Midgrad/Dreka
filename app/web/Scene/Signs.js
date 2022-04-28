class SignBase extends Interactable {
    /**
       @param {ComplexSign} sign
    */
    constructor(sign) {
        super(sign.interaction);

        // Data
        this.sign = sign;
        this.viewer = sign.viewer;
    }

    clear() {}

    flyTo() { return false; }

    rebuild() {}

    setDragging(dragging) {
        super.setDragging(dragging);

        if (this.sign.changed && this.sign.changedCallback)
            this.sign.changedCallback();
    }

    drag(position, badCartesian, modifier) {
        var scene = this.viewer.scene;
        var camera = scene.camera;
        var cartesian = this.sign.position;

        // Normal by camera if any modifier, else normal by surface
        var normal = Cesium.defined(modifier) ?
            Cesium.Cartesian3.subtract(scene.camera.position, cartesian, new Cesium.Cartesian3()) :
            scene.globe.ellipsoid.geodeticSurfaceNormal(cartesian);

        if (!Cesium.defined(normal))
            return false;

        normal = Cesium.Cartesian3.normalize(normal, normal);

        // Cast ray from camera to plane projected by cartesian and normal
        var ray = this.viewer.scene.camera.getPickRay(position);
        var plane = Cesium.Plane.fromPointNormal(cartesian, normal);
        var newCartesian = Cesium.IntersectionTests.rayPlane(ray, plane);

        this.sign.changed = this._onDrag(newCartesian, modifier);
        if (this.sign.changed)
            this.sign.rebuild();

        return this.sign.changed;
    }

    _onDrag(newCartesian, modifier) { return false; }
};

class SvgSign extends SignBase {
    /**
       @param {ComplexSign} sign
       @param {URL} svg - url to svg icon
    */
    constructor(sign, svg) {
        super(sign);

        // Visual
        this.normalScale = 1.0;
        this.hoveredScale = 1.25;
        this.selectedScale = 1.5;

        var that = this;
        this.point = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return sign.position; }, false),
            billboard: {
                image: svg,
                scale: new Cesium.CallbackProperty(() => { return that.selected
                                                       ? that.selectedScale
                                                       : that.hovered || that.dragging
                                                       ? that.hoveredScale
                                                       : that.normalScale; }, false),
                color: new Cesium.CallbackProperty(() => { return sign.highlighted
                                                       ? Cesium.Color.AQUA
                                                       : sign.data.current
                                                       ? Cesium.Color.MAGENTA : sign.data.reached
                                                       ? Cesium.Color.AQUAMARINE : sign.normalColor }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                show: new Cesium.CallbackProperty(() => { return sign.visible && sign.validPosition;
                                                  }, false)
            },
            label: {
                showBackground: true,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica",
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                text: new Cesium.CallbackProperty(() => { return sign.name(); }),
                show: new Cesium.CallbackProperty(() => { return sign.visible && that.hovered
                                                                 && !that.selected; }, false)
            }
        });
    }

    clear() { this.viewer.entities.remove(this.point); }

    flyTo() {
        this.viewer.flyTo(this.point);
        return true;
    }

    selfClick(modifier) {
        if (this.sign.clickedCallback) {
            var screenPosition = this.sign.selfPosition();
            this.sign.clickedCallback(screenPosition ? screenPosition.x : event.position.x,
                                      screenPosition ? screenPosition.y : event.position.y);
            return true;
        }
        return false;
    }

    matchInteraction(objects) {
        return objects.find(object => { return object.id === this.point });
    }

    _onDrag(newCartesian, modifier) {
        var newCartographic = Cesium.Cartographic.fromCartesian(newCartesian);
        // Modify only altitude if SHIFT
        if (modifier !== Cesium.KeyboardEventModifier.SHIFT) {
            this.sign.data.position.latitude = Cesium.Math.toDegrees(newCartographic.latitude);
            this.sign.data.position.longitude = Cesium.Math.toDegrees(newCartographic.longitude);
        }
        this.sign.data.position.altitude = newCartographic.height;
        return true;
    }
}

class PylonSign extends SignBase {
    /**
       @param {ComplexSign} sign
     */
    constructor(sign) {
        super(sign);

        // Dash line to the terrain
        var that = this;
        this.pylon = this.viewer.entities.add({
             polyline: {
                 positions: new Cesium.CallbackProperty(() => {
                     return [sign.position, sign.terrainPosition];
                 }, false),
                 arcType: Cesium.ArcType.NONE,
                 material: new Cesium.PolylineArrowMaterialProperty(
                               new Cesium.CallbackProperty(() => { return sign.normalColor; })),
                 width: 4.0,
                 show: new Cesium.CallbackProperty(() => { return sign.visible && sign.validTerrain;
                                                   }, false)
             },
        });
    }

    clear() { this.viewer.entities.remove(this.pylon); }
}

class LoiterSign extends SignBase {
    /**
       @param {ComplexSign} sign
    */
    constructor(sign) {
        super(sign);

        // Visual
        this.normalWidth = 2.0;
        this.hoveredWidth = 3.0;

        // Circle for loiters
        var that = this;
        this.loiter = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return sign.position; }, false),
            ellipse: {
                fill: false,
                outline: true,
                outlineWidth: new Cesium.CallbackProperty(() => {
                    return that.hovered ? that.hoveredWidth : that.normalWidth;
                }, false),
                outlineColor: new Cesium.CallbackProperty(() => { return sign.normalColor; }),
                show: new Cesium.CallbackProperty(() => { return sign.visible && sign.validTerrain;
                                                  }, false)
            }
        });
        // TODO: show loiter direction
    }

    clear() { this.viewer.entities.remove(this.loiter); }

    rebuild() {
        var params = this.sign.data.params;
        var position = this.sign.data.position;
        var loiterRadius = params && params.radius ? params.radius : 0;
        this.loiter.ellipse.semiMinorAxis = loiterRadius;
        this.loiter.ellipse.semiMajorAxis = loiterRadius;
        this.loiter.ellipse.height = position && position.altitude ? position.altitude : 0;
        // TODO: clockwise
    }

    matchInteraction(objects) {
        return objects.find(object => { return object.id === this.loiter });
    }

    // TODO: Click on loiter to change clockwise

    _onDrag(newCartesian, modifier) {
        var distance = Cesium.Cartesian3.distance(newCartesian, this.sign.position);
        var params = this.sign.data.params;

        // Modify loiter radius
        if (!Cesium.defined(params.radius))
            return false;

        this.sign.data.params.radius = distance;
        return true;
    }
}

class AcceptSign extends SignBase {
    /**
       @param {ComplexSign} sign
    */
    constructor(sign) {
        super(sign);

        // Accept radius
        var that = this;
        this.accept = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return sign.position; }, false),
            ellipse: {
                material: Cesium.Color.CADETBLUE.withAlpha(0.5),
                outline: true,
                outlineWidth: new Cesium.CallbackProperty(() => { return that.hovered ? 3.0 : 2.0;
                                                          }, false),
                outlineColor: Cesium.Color.CADETBLUE.withAlpha(0.5),
                show: new Cesium.CallbackProperty(() => { return sign.visible && sign.validTerrain;
                                                  }, false)
            }
        });
    }

    clear() { this.viewer.entities.remove(this.accept); }

    rebuild() {
        var params = this.sign.data.params;
        var position = this.sign.data.position;
        var acceptRadius = params && params.accept_radius ? params.accept_radius : 0;
        this.accept.ellipse.semiMinorAxis = acceptRadius;
        this.accept.ellipse.semiMajorAxis = acceptRadius;
        this.accept.ellipse.height = position && position.altitude ? position.altitude : 0;
    }

    matchInteraction(objects) {
        return objects.find(object => { return object.id === this.accept });
    }

    _onDrag(newCartesian, modifier) {
        var distance = Cesium.Cartesian3.distance(newCartesian, this.sign.position);
        var params = this.sign.data.params;

        // Modify accept radius
        if (!Cesium.defined(params.accept_radius))
            return false;

        this.sign.data.params.accept_radius = distance;
        return true;
    }
}

class ComplexSign {
    /**
       @param {Cesium.Viewer} viewer
       @param {Interaction} interaction
       @param {URL} svg - url to svg icon
     */
    constructor(viewer, interaction, svg, pylon = true, loiter = false, accept = false) {

        // Callbacks
        this.changedCallback = null;
        this.clickedCallback = null;

        // Data
        this.viewer = viewer;
        this.interaction = interaction;

        this.changed = false;
        this.visible = true;
        this.position = Cesium.Cartesian3.ZERO;
        this.validPosition = false;
        this.terrainPosition = Cesium.Cartesian3.ZERO;
        this.terrainAltitude = 0;
        this.validTerrain = false;
        this.data = null;
        this.highlighted = false;

        // Visual
        this.normalColor = Cesium.Color.WHITE;
        this.signs = []

        if (svg)
            this.signs.push(new SvgSign(this, svg));
        if (pylon)
            this.signs.push(new PylonSign(this));
        if (loiter)
            this.signs.push(new LoiterSign(this));
        if (accept)
            this.signs.push(new AcceptSign(this));
    }

    clear() { // TODO: done
        for (const sign of this.signs) { sign.clear(); }
    }

    /**
        @param {JSON} data - JSON, must contain latitude, longitude, altitude (AMSL)
    */
    update(data) {
        this.data = data;
        this.changed = false;

        this.rebuild();
    }

    rebuild() {
        var position = this.data.position;
        var latitude = position ? position.latitude : undefined;
        var longitude = position ? position.longitude : undefined;
        var altitude = position ? position.altitude : undefined;

        if (Cesium.defined(latitude) &&
            Cesium.defined(longitude) &&
            Cesium.defined(altitude)) {
            this.validPosition = true;
            this.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
            this.terrainPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, this.terrainAltitude);

            // Sample terrain position from the ground
            var cartographic = Cesium.Cartographic.fromCartesian(this.terrainPosition);
            var that = this;
            var promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [cartographic]);
            Cesium.when(promise, updatedPositions => {
                            that.terrainPosition = Cesium.Cartographic.toCartesian(cartographic);
                            that.terrainAltitude = cartographic.height;
                            that.validTerrain = true;
                        });
        } else {
            this.validPosition = false;
            this.position = Cesium.Cartesian3.ZERO;

            this.validTerrain = false;
            this.terrainAltitude = 0;
            this.terrainPosition = Cesium.Cartesian3.ZERO;
        }

        for (const sign of this.signs) { sign.rebuild(); }
    }

    setEnabled(enabled) {
        for (const sign of this.signs) { sign.setEnabled(enabled); }
    }

    setVisible(visible) { this.visible = visible; }

    flyTo() {
        for (const sign of this.signs) {
            if (sign.flyTo())
                break;
        }
    }

    name() { return this.data.name; }

    selfPosition() {
        return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position);
    }

    setHighlighted(highlighted) { this.highlighted = highlighted; }
}
