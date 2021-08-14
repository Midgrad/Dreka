// TODO: coomon with Adsb
class Vehicles {
    constructor(cesium) {

        this.vehicles = new Map();
        this.viewer = cesium.viewer;

        var that = this;
    }

    setVehicleData(vehicle, data) {

        console.log(vehicle);

        var position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.satelliteAltitude);
        var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.heading), 0, 0);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        if (this.vehicles.has(vehicle)) {
            var entity = this.vehicles.get(vehicle);
            entity.position = position;
            entity.orientation = orientation;
        } else {
             var newEntity = this.viewer.entities.add({
                 name: data.callsign,
                 position: position,
                 orientation: orientation,
                 model: {
                     uri: "./flying_wing.glb",
                     minimumPixelSize: 64,
                     maximumScale: 20000
                 }
             });
             this.vehicles.set(vehicle, newEntity);
        }
    }

    clear() {
        this.vehicles.forEach((value) => { this.viewer.entities.remove(value); } );
        this.vehicles.clear();
    }
}
