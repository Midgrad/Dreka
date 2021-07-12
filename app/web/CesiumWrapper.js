class CesiumWrapper {
    constructor(container, viewportController) {
        // Your access token can be found at: https://cesium.com/ion/tokens.
        // Replace `your_access_token` with your Cesium ion access token.
        // --> Cesium.Ion.defaultAccessToken = 'your_access_token';

        // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
        const viewer = new Cesium.Viewer(container, { terrainProvider: Cesium.createWorldTerrain() });
        // Add Cesium OSM Buildings, a global 3D buildings layer.
        const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

        // connect to a fly to signal
        viewportController.flyTo.connect(function(latitude, longitude, height, heading, pitch, duration) {
            viewer.camera.flyTo({
                         destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                         orientation : {
                             heading : Cesium.Math.toRadians(heading),
                             pitch : Cesium.Math.toRadians(pitch),
                         },
                         duration: duration
                     });
        });

        viewer.scene.canvas.addEventListener('mousemove', function(event) {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            // Mouse over the globe to see the cartographic position
            var cartesian = viewer.camera.pickEllipsoid(
                        new Cesium.Cartesian3(event.clientX, event.clientY), ellipsoid);
            if (cartesian) {
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                viewportController.cursorLatitude = Cesium.Math.toDegrees(cartographic.latitude);
                viewportController.cursorLongitude = Cesium.Math.toDegrees(cartographic.longitude);
                //viewportController.cursorHeight = cartographic.height;
            } else {
                viewportController.cursorLatitude = NaN;
                viewportController.cursorLongitude = NaN;
                //viewportController.cursorHeight = NaN;
            }
        });
    }
}

const webChannel = new QWebChannel(qt.webChannelTransport, function(channel) {
    const viewportController = channel.objects.viewportController;
    const cesium = new CesiumWrapper('cesiumContainer', viewportController);
});
