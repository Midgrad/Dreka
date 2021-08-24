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
            geocoder: false,
            selectionIndicator: false,
            infoBox: false,
            scene3DOnly: true,
//            terrainProviderViewModels: terrain,
//            selectedTerrainProviderViewModel: terrain[1]

            terrainProvider: Cesium.createWorldTerrain({
                requestVertexNormals: true,
                requestWaterMask: true
            })
        });

        this.viewer.scene.globe.depthTestAgainstTerrain = true;

        // Add Cesium OSM Buildings, a global 3D buildings layer.
        const buildingTileset = this.viewer.scene.primitives.add(Cesium.createOsmBuildings());
    }
}

const cesium = new CesiumWrapper('cesiumContainer');
const input = new Input(cesium);

const webChannel = new QWebChannel(qt.webChannelTransport, function(channel) {
    const ruler = new Ruler(cesium, channel.objects.rulerController);
    input.subscribe(ruler);

    const grid = new Grid(cesium, channel.objects.gridController);

    const layers = new Layers(cesium, channel.objects.layersController);

    var viewportController = channel.objects.viewportController;
    if (viewportController) {
        const viewport = new Viewport(cesium);
        input.subscribe(viewport);

        viewportController.flyTo.connect(function(center, heading, pitch, duration) {
            viewport.flyTo(center, heading, pitch, duration);
        });

        viewportController.lookTo.connect(function(heading, pitch, duration) {
            viewport.lookTo(heading, pitch, duration);
        });

        viewport.subscribeCamera(function() {
            viewportController.heading = viewport.heading;
            viewportController.pitch = viewport.pitch;
            viewportController.cameraPosition = viewport.cameraPosition;
            viewportController.centerPosition = viewport.centerPosition;
            viewportController.pixelScale = viewport.pixelScale;
        });

        viewport.subscribeCursor(function() {
            viewportController.cursorPosition = viewport.cursorPosition;
        });

        viewportController.restore();
    }

    var routesController = channel.objects.routesController;
    if (routesController) {
        const routes = new Routes(cesium);
        input.subscribe(routes);

        routesController.routesChanged.connect(function() {
            routes.setRoutes(routesController.routes);
        });
        routes.setRoutes(routesController.routes);
    }

    var vehiclesController = channel.objects.vehiclesController;
    if (vehiclesController) {
        const vehicles = new Vehicles(cesium);
        vehiclesController.vehicleDataChanged.connect(function(vehicle, data) {
            vehicles.setVehicleData(vehicle, data);
        });

        vehiclesController.vehicles.forEach((vehicle) => {
            console.log(vehicle)
            vehicles.setVehicleData(vehicle, vehiclesController.vehicleData(vehicle));
        });
    }

    var adsbController = channel.objects.adsbController;
    if (adsbController) {
        const adsb = new Adsb(cesium);
        adsbController.adsbChanged.connect(function(data) { adsb.setData(data); });
    }
});
