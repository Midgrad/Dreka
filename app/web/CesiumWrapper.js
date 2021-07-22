class CesiumWrapper {
    constructor(container) {
        // Your access token can be found at: https://cesium.com/ion/tokens.
        // Replace `your_access_token` with your Cesium ion access token.
        // --> Cesium.Ion.defaultAccessToken = 'your_access_token';

        // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
        this.viewer = new Cesium.Viewer(container, { terrainProvider: Cesium.createWorldTerrain() });
        // Add Cesium OSM Buildings, a global 3D buildings layer.
        const buildingTileset = this.viewer.scene.primitives.add(Cesium.createOsmBuildings());
    }
}

const cesium = new CesiumWrapper('cesiumContainer');

const webChannel = new QWebChannel(qt.webChannelTransport, function(channel) {
    const ruler = new RulerAdapter(cesium, channel.objects.rulerController);
    const viewport = new ViewportAdapter(cesium, channel.objects.viewportController);
});
