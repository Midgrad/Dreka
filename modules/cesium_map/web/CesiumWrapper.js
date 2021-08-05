class CesiumWrapper {
    constructor(container) {
        // Your access token can be found at: https://cesium.com/ion/tokens.
        // Replace `your_access_token` with your Cesium ion access token.
        // --> Cesium.Ion.defaultAccessToken = 'your_access_token';

//        var terrain = Cesium.createDefaultTerrainProviderViewModels();

        // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
        this.viewer = new Cesium.Viewer(container, {
            orderIndependentTranslucency: false,
            timeline: false,
            geocoder : false,
            selectionIndicator : false,
            infoBox : false,
//            terrainProviderViewModels: terrain,
//            selectedTerrainProviderViewModel: terrain[1]

            terrainProvider: Cesium.createWorldTerrain({
                requestVertexNormals : true,
                requestWaterMask : true
            })
        });

        this.viewer.scene.globe.depthTestAgainstTerrain = true;

        // Add Cesium OSM Buildings, a global 3D buildings layer.
        const buildingTileset = this.viewer.scene.primitives.add(Cesium.createOsmBuildings());
    }
}

const cesium = new CesiumWrapper('cesiumContainer');

const webChannel = new QWebChannel(qt.webChannelTransport, function(channel) {
    const ruler = new Ruler(cesium, channel.objects.rulerController);
    const grid = new Grid(cesium, channel.objects.gridController);
    const layers = new Layers(cesium, channel.objects.layersController);
    const viewport = new Viewport(cesium, channel.objects.viewportController);
});
