// TODO: common with Adsb

class Vehicle {
    constructor(viewer, callsign, parent) {

        this.parent = parent;
        this.viewer = viewer;

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
                silhouetteSize: 3,
               // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        this.pylon = viewer.entities.add({
            polyline: {
                width: 5,
                arcType: Cesium.ArcType.NONE,
                material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.AQUA),
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
            !Cesium.defined(data.latitude) || !Cesium.defined(data.satelliteAltitude))
            return;

        // Get the position
        var position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.satelliteAltitude);
        var groundPosition = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, 0);

        // Get the orientation
        var hpr;
        if (Cesium.defined(data.heading) && Cesium.defined(data.pitch) && Cesium.defined(data.roll))
            hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.heading),
                                              Cesium.Math.toRadians(-data.roll),
                                              Cesium.Math.toRadians(data.pitch));
        else
            hpr = new Cesium.HeadingPitchRoll(0, 0, 0);

        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        // Update vehicle position & orientation
        this.vehicle.position = position;
        this.vehicle.orientation = orientation;

        // Update pylon position
        this.pylon.polyline.positions = [position, groundPosition];

        // Add track points
        var point = this.viewer.entities.add({
            position: position,
            point: {
                pixelSize : 2,
                color: Cesium.Color.AQUA,
            }
        });
        this.track.push(point);

        // Remove extra points
        if (this.parent.trackLength >= 0) {
            var pointsToClear = this.track.length - this.parent.trackLength;
            for (var i = 0; i < pointsToClear; ++i) {
                this.viewer.entities.remove(this.track.shift());
            }
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
        if (this.selectedVehicle && tracking)
            this.viewer.trackedEntity = this.selectedVehicle.vehicle;
        else
            this.viewer.trackedEntity = undefined;
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
