// TODO: common with Adsb

class Vehicle {
    constructor(viewer, callsign, parent) {

        this.parent = parent;
        this.viewer = viewer;

        this.position = Cesium.Cartesian3.fromDegrees(NaN, NaN, NaN);
        this.groundPosition = Cesium.Cartesian3.fromDegrees(NaN, NaN, NaN);
        this.hpr = new Cesium.HeadingPitchRoll(0, 0, 0);

        var that = this;

        this.track = [];
        this.vehicle = viewer.entities.add({
            name: callsign,
            model: {
                uri: "./models/fixed_wing.glb",
                minimumPixelSize: 128,
                maximumScale: 40000,
                color: Cesium.Color.TEAL,
                colorBlendMode: Cesium.ColorBlendMode.REPLACE,
                silhouetteColor: Cesium.Color.AQUA,
                silhouetteSize: 3
            }
        });
        this.pylon = viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function() {
                    return [that.position, that.groundPosition];
                }, false),
                width: 5,
                arcType: Cesium.ArcType.NONE,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.AQUA)
            },
        });
    }

    done() {
        this.viewer.entities.remove(this.pylon);
        this.viewer.entities.remove(this.vehicle);
        this.track.forEach((value) => { this.viewer.entities.remove(value); } );
        this.track.clear();
    }

    setData(data) {
        // Ignore data with no position
        if (!Cesium.defined(data) || !Cesium.defined(data.longitude) ||
            !Cesium.defined(data.latitude) || !Cesium.defined(data.altitudeAmsl))
            return;

        // Get the position
        this.position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.altitudeAmsl);

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

        // Update ground position with terrain sample
        var that = this;
        var terrainPoint = Cesium.Cartographic.fromDegrees(data.longitude, data.latitude, 0);
        if (Cesium.defined(terrainPoint)) {
            var promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [terrainPoint]);
            Cesium.when(promise, function(updatedPositions) {
                if (!updatedPositions || !Array.isArray(updatedPositions))
                    return;

                var cartesian = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude,
                                                              updatedPositions[0].height);
                if (Cesium.defined(cartesian))
                    that.groundPosition = cartesian;
            });
        }
    }
}

class Vehicles {
    constructor(cesium) {
        this.vehicles = new Map();
        this.selectedVehicle = null;
        this.viewer = cesium.viewer;

        this.trackLength = 250;
    }

    setTrackLength(trackLength) {
        this.trackLength = trackLength;
    }

    selectVehicle(vehicleId) {
        this.selectedVehicle = this.vehicles.has(vehicleId) ? this.vehicles.get(vehicleId) : null;
    }

    setTracking(tracking) {
        if (this.selectedVehicle && tracking) {
            this.viewer.trackedEntity = this.selectedVehicle.vehicle;
        }
        else {
            this.viewer.trackedEntity = undefined;
        }
    }

    setVehicleData(vehicleId, data) {
        var vehicle;
        if (this.vehicles.has(vehicleId)) {
            vehicle = this.vehicles.get(vehicleId);
        } else {
            vehicle = new Vehicle(this.viewer, vehicleId, this)
            this.vehicles.set(vehicleId, vehicle);
        }
        vehicle.setData(data);
    }

    clear() {
        this.vehicles.forEach((value) => { value.done() } );
        this.vehicles.clear();
    }
}
