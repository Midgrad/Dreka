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

    initInstruments() {
        this.input = new Input(cesium.viewer);

        var that = this;
        this.webChannel = new QWebChannel(qt.webChannelTransport, function(channel) {
            const ruler = new Ruler(that.viewer, channel.objects.rulerController);
            that.input.subscribe(ruler);

            const grid = new Grid(that.viewer, channel.objects.gridController);
            const layers = new Layers(that.viewer, channel.objects.layersController);

            var viewportController = channel.objects.viewportController;
            if (viewportController) {
                const viewport = new Viewport(that.viewer);
                that.input.subscribe(viewport);

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
        });
    }

    initData() {
        var that = this;
        const webChannel = new QWebChannel(qt.webChannelTransport, function(channel) {
            var routesController = channel.objects.routesController;
            if (routesController) {
                const routes = new Routes(that.viewer);
                that.input.subscribe(routes);

                var setWaypoint = (routeId, index) => {
                    routesController.waypointData(routeId, index, waypointData => {
                        routes.setWaypointData(routeId, waypointData);
                    });
                }

                var setRoute = routeId => {
                    routesController.routeData(routeId, routeData => {
                        routes.setRouteData(routeId, routeData);

                        if (routesController.selectedRoute === routeId)
                            routes.setEditingRoute(routeId);

                        for (var index = 0; index < routeData.waypoints; ++index)
                            setWaypoint(routeId, index);
                    });
                };

                routesController.routeIds.forEach(routeId => setRoute(routeId));

                routesController.routeAdded.connect(routeId => setRoute(routeId));
                routesController.routeChanged.connect(routeId => setRoute(routeId));
// TODO:        routesController.routeRemoved.connect(routeId =>

                routesController.waypointAdded.connect((routeId, index) => setWaypoint(routeId, index));
                routesController.waypointChanged.connect((routeId, index) => setWaypoint(routeId, index));
// TODO:        routesController.waypointRemoved.connect((routeId, index) =>

                routesController.centerRoute.connect(routeId => { routes.centerRoute(routeId); });
                routesController.selectedRouteChanged.connect(routeId => { routes.setEditingRoute(routeId); });
                routesController.centerWaypoint.connect((routeId, index) => { routes.centerWaypoint(routeId, index); });
            }

            var vehiclesController = channel.objects.vehiclesController;
            if (vehiclesController) {
                const vehicles = new Vehicles(that.viewer);
                vehiclesController.vehicleDataChanged.connect((vehicleId, data) => {
                    vehicles.setVehicleData(vehicleId, data);
                });

                vehiclesController.vehicles.forEach(vehicle => {
                    vehiclesController.vehicleData(vehicle.id, function(vehicleData) {
                        vehicles.setVehicleData(vehicle.id, vehicleData);
                    });
                });

                vehiclesController.trackLengthChanged.connect(() => {
                    vehicles.setTrackLength(vehiclesController.trackLength);
                });
                vehicles.setTrackLength(vehiclesController.trackLength);

                vehiclesController.selectedVehicleChanged.connect(() => {
                    vehicles.selectVehicle(vehiclesController.selectedVehicle);
                });
                vehicles.selectVehicle(vehiclesController.selectedVehicle);

                vehiclesController.trackingChanged.connect(() => {
                    vehicles.setTracking(vehiclesController.tracking);
                });
            }

            var adsbController = channel.objects.adsbController;
            if (adsbController) {
                const adsb = new Adsb(that.viewer);
                adsbController.adsbChanged.connect((data) => { adsb.setData(data); });
            }
        });
    }
}

const cesium = new CesiumWrapper('cesiumContainer');
cesium.initInstruments();

var heightMaps = cesium.viewer.terrainProvider;
var heightCheck = setInterval(function () {
    if (heightMaps.ready) {
        clearInterval(heightCheck);

        cesium.initData();
    }
}, 1000);
