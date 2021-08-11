// TODO: move adsb js to adsb module
class Adsb {
    constructor(cesium) {

        this.aircrafts = [];
        this.viewer = cesium.viewer;

        var that = this;
    }

    setData(adsb) {
        this.clear();

        for (var i = 0; i < adsb.length; ++i) {
            this.addAircraft(adsb[i]);
        }
    }

    addAircraft(state) {
        var position = Cesium.Cartesian3.fromDegrees(state.position.longitude,
                                                     state.position.latitude,
                                                     state.position.altitude);
        var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(state.heading), 0, 0);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        this.aircrafts.push(this.viewer.entities.add({
            name: state.callsign,
            position: position,
            orientation: orientation,
            model: {
                uri: "./a320.glb",
                minimumPixelSize: 128,
                maximumScale: 20000
            }
        }));
    }

    clear() {
        for (var i = 0; i < this.aircrafts.length; ++i) {
            this.viewer.entities.remove(this.aircrafts[i]);
        }
        this.points = [];
    }
}
