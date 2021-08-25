// TODO: common with Adsb

class Vehicle {
    constructor(viewer, callsign) {

        this.track = [];
        this.viewer = viewer;
        this.vehicle = viewer.entities.add({
            name: callsign,
            model: {
                uri: "./models/flying_wing.glb",
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
        this.viewer.entities.remove(this.vehicle);
        this.track.forEach((value) => { this.viewer.entities.remove(value); } );
        this.track.clear();
    }

    setData(data) {
        if (!Cesium.defined(data) || !Cesium.defined(data.longitude) ||
            !Cesium.defined(data.latitude) || !Cesium.defined(data.satelliteAltitude))
            return;

        var position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.satelliteAltitude);
        var groundPosition = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, 0);

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
    }
}

class Vehicles {
    constructor(cesium) {
        this.vehicles = new Map();
        this.viewer = cesium.viewer;
    }

    setVehicleData(vehicleId, data) {
        var vehicle;
        if (this.vehicles.has(vehicleId)) {
            vehicle = this.vehicles.get(vehicleId);
        } else {
            vehicle = new Vehicle(this.viewer, vehicleId)
            this.vehicles.set(vehicleId, vehicle);
        }
        vehicle.setData(data);
    }

    clear() {
        this.vehicles.forEach((value) => { value.done() } );
        this.vehicles.clear();
    }
}
