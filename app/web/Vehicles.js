// TODO: common with Adsb
class Vehicles {
    constructor(cesium) {

        this.vehicles = new Map();
        this.viewer = cesium.viewer;

        var that = this;
    }

    setVehicleData(vehicle, data) {
        if (!Cesium.defined(data) || !Cesium.defined(data.longitude) ||
            !Cesium.defined(data.latitude) || !Cesium.defined(data.satelliteAltitude))
            return;

        var position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.satelliteAltitude);

        var hpr;
        if (Cesium.defined(data.heading) && Cesium.defined(data.pitch) && Cesium.defined(data.roll))
            hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.heading),
                                              Cesium.Math.toRadians(-data.roll),
                                              Cesium.Math.toRadians(data.pitch));
        else
            hpr = new Cesium.HeadingPitchRoll(0, 0, 0);

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
                     uri: "./models/flying_wing.glb",
                     minimumPixelSize: 128,
                     maximumScale: 40000,
                     color: Cesium.Color.AQUA
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
