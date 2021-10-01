class CesiumWrapper {
    constructor(container) {
        // Your access token can be found at: https://cesium.com/ion/tokens.
        // Replace `your_access_token` with your Cesium ion access token.
        // --> Cesium.Ion.defaultAccessToken = 'your_access_token';

        // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
        this.viewer = new Cesium.Viewer(container, {
            orderIndependentTranslucency: false,
            timeline: false,
            geocoder: false,
            selectionIndicator: false,
            infoBox: false,
            scene3DOnly: true,
            shouldAnimate: true,

            terrainProvider: Cesium.createWorldTerrain({
                requestVertexNormals: true,
                requestWaterMask: true
            })
        });

//        Alternate terrainProvider
//        this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
//            url: 'https://api.maptiler.com/tiles/terrain-quantized-mesh/?key={key}' // get your own key at https://cloud.maptiler.com/
//        });

        // Disable depth test for showing entities under terrain
        this.viewer.scene.globe.depthTestAgainstTerrain = false;

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

    var missionsController = channel.objects.missionsController;
    if (missionsController) {
        const routes = new Routes(cesium);
        input.subscribe(routes);

        missionsController.missions.forEach((missionId) => {
            missionsController.route(missionId, function(routeData) {
                routes.setRouteData(missionId, routeData);
            });
        });

        missionsController.routeChanged.connect((missionId) => {
            missionsController.route(missionId, function(routeData) {
                routes.setRouteData(missionId, routeData);
            });
        });

        missionsController.missionsChanged.connect(() => {
            var missionIds = missionsController.missions;
            routes.routeIds().forEach((routeId) => {
                var index = missionIds.indexOf(routeId);
                // Don't touch existing routes
                if (index > -1) {
                    missionIds.splice(index, 1);
                }
                // Add new route
                else {
                    missionsController.route(routeId, function(routeData) {
                        routes.setRouteData(routeId, routeData);
                    });
                }
            });
            // Remove deleted routes
            missionIds.forEach((missionId) => {
                routes.removeRoute(missionId);
            });
        });

        missionsController.centerRoute.connect(function(missionId) { routes.centerRoute(missionId); });
    }

    var vehiclesController = channel.objects.vehiclesController;
    if (vehiclesController) {
        const vehicles = new Vehicles(cesium);
        vehiclesController.vehicleDataChanged.connect(function(vehicle, data) {
            vehicles.setVehicleData(vehicle, data);
        });

        vehiclesController.vehicles.forEach((vehicle) => {
            vehiclesController.vehicleData(vehicle, function(vehicleData) {
                vehicles.setVehicleData(vehicle, vehicleData);
            });
        });

        vehiclesController.trackLengthChanged.connect(function() {
            vehicles.setTrackLength(vehiclesController.trackLength);
        });
        vehicles.setTrackLength(vehiclesController.trackLength);

        vehiclesController.selectedVehicleChanged.connect(function() {
            vehicles.selectVehicle(vehiclesController.selectedVehicle);
        });
        vehicles.selectVehicle(vehiclesController.selectedVehicle);

        vehiclesController.trackingChanged.connect(function() {
            vehicles.setTracking(vehiclesController.tracking);
        });
    }

    var adsbController = channel.objects.adsbController;
    if (adsbController) {
        const adsb = new Adsb(cesium);
        adsbController.adsbChanged.connect(function(data) { adsb.setData(data); });
    }
});
