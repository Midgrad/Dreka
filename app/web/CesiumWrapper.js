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

    init() {
        var that = this;

        this.input = new Input(this.viewer);
        this.viewport = new Viewport(this.viewer);
        this.input.subscribe(InputTypes.ON_MOVE, (event, cartesian, modifier) => {
            return that.viewport.onMove(cartesian);
        });

        this.viewport.subscribeCamera((heading, pitch, cameraPosition, centerPosition, pixelScale) => {
            that.input.pixelScale = pixelScale;
        });

        this.webChannel = new QWebChannel(qt.webChannelTransport, (channel) => {
            var menuController = channel.objects.menuController;
            if (menuController) {
                that.input.subscribe(InputTypes.ON_CLICK, (event, cartesian, modifier) => {
                    if (Cesium.defined(modifier) || !Cesium.defined(cartesian))
                        return;

                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                    var altitude = cartographic.height;
                    menuController.invoke(event.position.x, event.position.y,
                                          latitude, longitude, altitude);
                    return true;
                });
            }

            var rulerController = channel.objects.rulerController;
            if (rulerController) {
                const ruler = new Ruler(that.viewer, that.input);
                rulerController.cleared.connect(() => { ruler.clear(); });
                rulerController.rulerModeChanged.connect(mode => { ruler.setEnabled(mode) });
                ruler.subscribeDistance(distance => { rulerController.distance = distance; });
            }

            // TODO: grid and layers optional
            const grid = new Grid(that.viewer, channel.objects.gridController);
            const layers = new Layers(that.viewer, channel.objects.layersController);

            var viewportController = channel.objects.viewportController;
            if (viewportController) {
                viewportController.flyTo.connect((center, heading, pitch, duration) => {
                    that.viewport.flyTo(center, heading, pitch, duration);
                });

                viewportController.lookTo.connect((heading, pitch, duration) => {
                    that.viewport.lookTo(heading, pitch, duration);
                });

                that.viewport.subscribeCamera((heading, pitch, cameraPosition, centerPosition, pixelScale) => {
                    viewportController.heading = heading;
                    viewportController.pitch = pitch;
                    viewportController.cameraPosition = cameraPosition;
                    viewportController.centerPosition = centerPosition;
                    viewportController.pixelScale = pixelScale;
                });

                that.viewport.subscribeCursor((cursorPosition) => { viewportController.cursorPosition = cursorPosition; });
                viewportController.restore();
            }

            var routesController = channel.objects.routesController;
            if (routesController) {
                const routes = new Routes(that.viewer, that.input);
                routes.waypointChangedCallback = (routeId, index, waypointData) => {
                    routesController.updateWaypoint(routeId, index, waypointData);
                }

                var setWaypoint = (routeId, index) => {
                    routesController.waypointData(routeId, index, waypointData => {
                        routes.setWaypointData(routeId, index, waypointData);
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
                routesController.routeRemoved.connect(routeId => routes.removeRoute(routeId));

                routesController.waypointAdded.connect((routeId, index) => setWaypoint(routeId, index));
                routesController.waypointChanged.connect((routeId, index) => setWaypoint(routeId, index));
                routesController.waypointRemoved.connect((routeId, index) => routes.removeWaypoint(routeId, index));

                routesController.centerRoute.connect(routeId => { routes.centerRoute(routeId); });
                routesController.selectedRouteChanged.connect(routeId => { routes.setEditingRoute(routeId); });
                routesController.centerWaypoint.connect((routeId, index) => { routes.centerWaypoint(routeId, index); });

                var waypointController = channel.objects.waypointController;
                if (waypointController) {
                    routes.waypointClickedCallback = (routeId, index, x, y) => {
                        waypointController.invokeWaypointMenu(routeId, index, x, y);
                    }
                    waypointController.setWaypointSelected.connect((routeId, index, opened) => {
                        routes.setWaypointSelected(routeId, index, opened);
                    });
                    this.viewport.subscribeCamera(() => {
                        var position = routes.selectedWaypointPosition();
                        if (Cesium.defined(position))
                            waypointController.updatePopupPosition(position.x, position.y);
                    });
                }
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

const cesiumWrapper = new CesiumWrapper('cesiumContainer');

// Init data when terrainProvider get ready
var heightMaps = cesiumWrapper.viewer.terrainProvider;
var heightCheck = setInterval(function () {
    if (heightMaps.ready) {
        clearInterval(heightCheck);

        cesiumWrapper.init();
    }
}, 100);
