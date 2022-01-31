// TODO: move adsb js to adsb module
class Adsb {
    constructor(viewer) {

        this.aircrafts = new Map();
        this.viewer = viewer;

        var that = this;
    }

    setData(adsb) {
        if (!adsb || !Array.isArray(adsb))
            return;

        adsb.forEach((state) => {
            var position = Cesium.Cartesian3.fromDegrees(state.position.longitude,
                                                      state.position.latitude,
                                                      state.position.altitude);
            var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(state.heading), 0, 0);
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

            if (this.aircrafts.has(state.code)) {
                var entity = this.aircrafts.get(state.code);
                entity.position = position;
                entity.orientation = orientation;
            } else {
                 var newEntity = this.viewer.entities.add({
                     name: state.callsign,
                     position: position,
                     orientation: orientation,
                     model: {
                         uri: "Assets/Models/a320.glb",
                         minimumPixelSize: 64,
                         maximumScale: 20000
                     }
                 });
                 this.aircrafts.set(state.code, newEntity);
            }
        } );
    }

    clear() {
        this.aircrafts.forEach((value) => { this.viewer.entities.remove(value); } );
        this.aircrafts.clear();
    }
}
