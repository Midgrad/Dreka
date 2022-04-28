// TODO: common with Adsb

class Vehicle {
    constructor(viewer, parent) {

        this.parent = parent;
        this.viewer = viewer;

        this.position = Cesium.Cartesian3.ZERO;
        this.terrainPosition = Cesium.Cartesian3.ZERO;
        this.hpr = new Cesium.HeadingPitchRoll(0, 0, 0);

        var that = this;

        this.track = [];

        // Vehicle 3D model
        this.vehicle = viewer.entities.add({
            model: {
                minimumPixelSize: 128,
                maximumScale: 40000,
                colorBlendMode: Cesium.ColorBlendMode.REPLACE,
                silhouetteSize: 3
            },
            box: {
                dimensions: new Cesium.Cartesian3(500.0, 500.0, 500.0),
                material: Cesium.Color.TRANSPARENT
            },
            label: {
                showBackground: true,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica",
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
        });

        // TODO: common pylon
        // Dash line to the terrain
        this.pylon = this.viewer.entities.add({
             polyline: {
                 positions: new Cesium.CallbackProperty(() => {
                     return [that.position, that.terrainPosition];
                 }, false),
                 arcType: Cesium.ArcType.NONE,
                 material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.AQUA),
                 width: 4.0
             }
        });
    }

    done() {
        this.viewer.entities.remove(this.pylon);
        this.viewer.entities.remove(this.vehicle);
        this.track.forEach((value) => { this.viewer.entities.remove(value); } );
        this.track.clear();
    }

    set(vehicle) {
        this.vehicle.model.uri = "Assets/Models/" + vehicle.model;
        this.vehicle.model.color = vehicle.online ? Cesium.Color.TEAL : Cesium.Color.SLATEGREY;
        this.vehicle.label.text = vehicle.name;
    }

    setSelected(selected) {
        this.vehicle.model.silhouetteColor = selected ? Cesium.Color.AQUA : Cesium.Color.SNOW;
        this.vehicle.label.show = selected;
    }

    setData(data) {
        // Ignore data with no position
        if (!Cesium.defined(data) || !Cesium.defined(data.longitude) ||
            !Cesium.defined(data.latitude) || !Cesium.defined(data.altitudeAmsl))
            return;

        // Get the position
        this.position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.altitudeAmsl);
        this.terrainPosition = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.altitudeAmsl);

        // Get the orientation
        if (Cesium.defined(data.heading) && Cesium.defined(data.pitch) && Cesium.defined(data.roll))
            this.hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.heading),
                                              Cesium.Math.toRadians(-data.roll),
                                              Cesium.Math.toRadians(data.pitch));

        // Update vehicle position & orientation
        this.vehicle.position = this.position;
        this.vehicle.orientation = Cesium.Transforms.headingPitchRollQuaternion(this.position, this.hpr);

        // Add track points
        var point = this.viewer.entities.add({
            position: this.position,
            point: {
                pixelSize : 2,
                color: Cesium.Color.AQUA,
            }
        });
        this.track.push(point);

        // Remove extra points
        if (this.parent.trackLength >= 0) {
            var pointsToClear = this.track.length - this.parent.trackLength;
            if (pointsToClear > 0) {
                for (var i = 0; i < pointsToClear; ++i) {
                    this.viewer.entities.remove(this.track.shift());
                }
            }
        }

        // Sample terrain position from the ground
        var cartographic = Cesium.Cartographic.fromCartesian(this.terrainPosition);
        var that = this;
        var promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [cartographic]);
        Cesium.when(promise, updatedPositions => {
                        that.terrainPosition = Cesium.Cartographic.toCartesian(cartographic);
                        that.terrainAltitude = cartographic.height;
                        that.pylon.polyline.show = true;
                        if (that.terrainCallback && !this.dragging)
                            that.terrainCallback(that.data.position.altitude - that.terrainAltitude);
                    });
    }
}

class Vehicles {
    constructor(viewer) {
        this.vehicles = new Map();
        this.selectedVehicleId = null;
        this.viewer = viewer;

        this.trackLength = 250;
    }

    setTrackLength(trackLength) {
        this.trackLength = trackLength;
    }

    selectVehicle(vehicleId) {
        if (this.selectedVehicleId === vehicleId)
            return;

        var vehicle = this.vehicles.get(this.selectedVehicleId);
        if (vehicle)
            vehicle.setSelected(false);

        this.selectedVehicleId = vehicleId;

        vehicle = this.vehicles.get(this.selectedVehicleId);
        if (vehicle)
            vehicle.setSelected(true);
    }

    setTracking(tracking) {
        var selectedVehicle = this.vehicles.has(this.selectedVehicleId) ?
                                  this.vehicles.get(this.selectedVehicleId) : null;
        if (selectedVehicle && tracking) {
            this.viewer.trackedEntity = selectedVehicle.vehicle;
        }
        else {
            this.viewer.trackedEntity = undefined;
        }
    }

    setVehicle(vehicleId, vehicle) {
        var vehicleJs;
        if (this.vehicles.has(vehicleId)) {
            vehicleJs = this.vehicles.get(vehicleId);
        } else {
            vehicleJs = new Vehicle(this.viewer, this)
            this.vehicles.set(vehicleId, vehicleJs);

            if (this.selectedVehicleId === vehicleId)
                vehicleJs.setSelected(true);
        }
        vehicleJs.set(vehicle);
    }

    setTelemetry(vehicleId, data) {
        if (this.vehicles.has(vehicleId))
            this.vehicles.get(vehicleId).setData(data);
    }

    clear() {
        this.vehicles.forEach((value) => { value.done() } );
        this.vehicles.clear();
    }
}
