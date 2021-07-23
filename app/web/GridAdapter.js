class GridAdapter {
    constructor(cesium, gridController) {

        this.viewer = cesium.viewer;

        var viewer = this.viewer;
        var scene = this.viewer.scene;
        var ellipsoid = scene.globe.ellipsoid;

        // clear signal
        gridController.enabledChanged.connect(function() {
            // TODO: enable/disagble grid
        });

        viewer.scene.postRender.addEventListener(function() {

            // Get camera ray ttrace point
            // Find closes lat/lon ref relative current scale
            // Draw grid according current grid
        });

//        var latLongLine = {}
//        //Draw longitude lines and longitude labels
//        latLongLine.lang = [];
//        //Longitude
//        let langS = [];
//        //Draw a line every 20°
//        for (var lang = -180; lang <= 180; lang += 20) {

//            // Draw the longitude
//            latLongLine.lang.push(this.viewer.entities.add({
//                  position: Cesium.Cartesian3.fromDegrees(lang, 0),
//                  polyline: {
//                      positions: Cesium.Cartesian3.fromDegreesArray([lang, -90, lang, 0, lang, 90]), //In order to circle the earth, an equator point is added
//                      width: 1.0,
//                      arcType: Cesium.ArcType.GEODESIC,
//                      material : Cesium.Color.DARKTURQUOISE,
//                      depthFailMaterial: Cesium.Color.DARKTURQUOISE,
//                  }
//              }));
//        }

//        //Because this is all implemented with polylines, it looks like a circle, so you must first get a denser longitude point
//        for (let lang = -180; lang <= 180; lang += 5) {
//            langS.push(lang);
//        }

//        // Draw longitude lines and latitude labels
//        latLongLine.lat = [];
//        // Draw a latitude line and latitude label every 10 readings
//        for (let lat = -80; lat <= 80; lat += 10) {
//            let text = "North Latitude";
//            if (lat < 0) {
//                text = "South Latitude";
//            } else if (lat === 0) {
//                text = "Equator";
//            }
//            text += "" + lat + "°";

//            latLongLine.lat.push(this.viewer.entities.add({
//             position: Cesium.Cartesian3.fromDegrees(0, lat), //This is mainly to allow the text to be displayed to the correct position
//             polyline: {
//                 // This bunch of syntactic sugar is because I’m too lazy to write a for loop conversion. In fact, the longitude and latitude are combined It is a two-dimensional array, and then converted to a string split, then converted to a one-dimensional array, and then converted to an array.
//                 positions: Cesium.Cartesian3.fromDegreesArray(langS.map(long => {
//                                                     return [long, lat].join(",")
//                                                 }).join(",").split(",").map(item => Number(item))),
//                 width: 1.0,
//                 arcType: Cesium.ArcType.GEODESIC,
//                 material : Cesium.Color.DARKTURQUOISE,
//                 depthFailMaterial: Cesium.Color.DARKTURQUOISE,
//             }
//         }));
//        }
    }
}
