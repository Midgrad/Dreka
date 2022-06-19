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
        this.interaction = new Interaction(this.viewer, this.input);
        this.viewport = new Viewport(this.viewer);
        this.input.subscribe(InputTypes.ON_MOVE, (event, cartesian, modifier) => {
            return that.viewport.onMove(cartesian);
        });

        this.webChannel = new QWebChannel(qt.webChannelTransport, (channel) => {
            var rulerController = channel.objects.rulerController;
            if (rulerController) {
                const ruler = new Ruler(that.viewer, that.interaction);
                rulerController.cleared.connect(() => { ruler.clear(); });
                rulerController.rulerModeChanged.connect(mode => { ruler.setEnabled(mode) });
                ruler.subscribeDistance(distance => { rulerController.distance = distance; });
            }

            // TODO: grid and layers optional
            const gridView = new Grid(that.viewer, channel.objects.gridController);
            const layersView = new Layers(that.viewer, channel.objects.layersController);

            var viewportController = channel.objects.viewportController;
            if (viewportController) {
                viewportController.flyTo.connect((center, heading, pitch, duration) => {
                    that.viewport.flyTo(center, heading, pitch, duration);
                });

                viewportController.lookTo.connect((heading, pitch, duration) => {
                    that.viewport.lookTo(heading, pitch, duration);
                });

                that.viewport.subscribeCamera((heading, pitch, cameraPosition, centerPosition,
                                               pixelScale, changed) => {
                    viewportController.heading = heading;
                    viewportController.pitch = pitch;
                    viewportController.cameraPosition = cameraPosition;
                    viewportController.centerPosition = centerPosition;
                    viewportController.pixelScale = pixelScale;
                });

                that.viewport.subscribeCursor((cursorPosition) => {
                    viewportController.cursorPosition = cursorPosition;
                });
                viewportController.restore();
                that.viewport.tick();
            }

//                var missionMenuController = channel.objects.missionMenuController;
//                if (missionMenuController) {
//                    routes.routeItemClickedCallback = (routeId, index, x, y) => {
//                        missionMenuController.invokeMenu(routeId, index, x, y);
//                    }
//                    that.viewport.subscribeCamera((heading, pitch, cameraPosition, centerPosition,
//                                                   pixelScale, changed) => {
//                        if (changed)
//                            missionMenuController.drop();
//                    });
//                }

//                var routePatternController = channel.objects.routePatternController;
//                if (routePatternController) {
//                    var routePatternArea = new Area(that.viewer, that.interaction);
//                    routePatternArea.changedCallback = () => {
//                        var positions = [];
//                        routePatternArea.points.forEach(point => {
//                            var cartographic = Cesium.Cartographic.fromCartesian(point.position);
//                            var position = {};
//                            position.latitude = Cesium.Math.toDegrees(cartographic.latitude);
//                            position.longitude = Cesium.Math.toDegrees(cartographic.longitude);
//                            position.altitude = cartographic.height;
//                            positions.push(position);
//                        });
//                        routePatternController.setAreaPositions(positions);
//                    };

//                    routePatternController.patternChanged.connect(() => {
//                        routePatternArea.setEnabled(routePatternController.pattern);
//                        routePatternController.areaPositions(positions => {
//                            routePatternArea.setPositions(positions);
//                        });
//                    });

//                    var routePatternPath = new Path(that.viewer, Cesium.Color.GOLD);
//                    routePatternController.pathPositionsChanged.connect(() => {
//                        routePatternPath.setPositions(routePatternController.pathPositions);
//                    });
//                }
//            }

//            var missionRouteController = channel.objects.missionRouteController;
//            if (missionRouteController) {
//                const home = new ComplexSign(that.viewer, that.interaction,
//                                             "Assets/Images/home.svg", true, true);
//                home.update(missionRouteController.home);
//                missionRouteController.homeChanged.connect(homeData => { home.update(homeData); });

//                const target = new ComplexSign(that.viewer, that.interaction,
//                                               "Assets/Images/target.svg", true, true);
//                target.editMode = true; // TODO: depend on vehicle's mode
//                target.changedCallback = () => {
//                    missionRouteController.navTo(target.data.position.latitude,
//                                                 target.data.position.longitude);
//                }
//                target.update(missionRouteController.target);
//                missionRouteController.targetChanged.connect(targetData => { target.update(targetData); });
//            }
            var missionsMapController = channel.objects.missionsMapController;
            if (missionsMapController) {
                const routesView = new Routes(that.viewer, that.interaction);

                routesView.routeItemChangedCallback = (routeId, index, routeItemData) => {
                    missionsMapController.updateRouteItem(routeId, index, routeItemData);
                }

                missionsMapController.missions(missions => {
                    for (const mission of missions) {
                        missionsMapController.route(route => { routesView.setRoute(mission.id, route); });

                        missionsMapController.routeItems(mission.id, routeItems => {
                            for (var index = 0; index < routeItems.length; ++index) {
                                routesView.setRouteItem(mission.id, index, routeItems[index]);
                            }
                        });
                    }
                });

                missionsMapController.selectedMissionChanged.connect(missionId => { routesView.selectRoute(missionId); });
                routesView.selectRoute(missionsMapController.selectedMissionId);
                missionsMapController.highlightItem.connect(index => { routesView.highlightItem(index); });

                missionsMapController.missionAdded.connect(mission => { routesView.setRoute(mission.id, mission); });
                // missionsMapController.missionChanged.connect(mission => { routesView.setRoute(mission.id, mission); });
                missionsMapController.missionRemoved.connect(missionId => { routesView.removeRoute(missionId); });

                missionsMapController.routeItemAdded.connect((routeId, index, data) => { routesView.setRouteItem(routeId, index, data); });
                missionsMapController.routeItemChanged.connect((routeId, index, data) => { routesView.setRouteItem(routeId, index, data); });
                missionsMapController.routeItemRemoved.connect((routeId, index) => { routesView.removeRouteItem(routeId, index); });

                missionsMapController.centerMission.connect(missionId => { routesView.centerRoute(missionId); });
                missionsMapController.centerRouteItem.connect((routeId, index) => { routesView.centerRouteItem(routeId, index); });

                var missionsMenuController = channel.objects.missionsMenuController;
                if (missionsMenuController) {
                    routesView.routeItemClickedCallback = (routeId, index, x, y) => {
                        missionsMenuController.invokeMenu(routeId, index, x, y);
                    }
                    that.viewport.subscribeCamera((heading, pitch, cameraPosition, centerPosition,
                        pixelScale, changed) => { if (changed) missionsMenuController.drop(); }
                    );
                }
            }

            var vehiclesMapController = channel.objects.vehiclesMapController;
            if (vehiclesMapController) {
                const vehiclesView = new Vehicles(that.viewer);

                vehiclesMapController.vehicles(vehicles => {
                    for (const vehicle of vehicles) {
                        vehiclesView.setVehicle(vehicle.id, vehicle);
                        vehiclesMapController.telemetry(vehicle.id, (telemetry) => {
                            vehiclesView.setTelemetry(vehicle.id, telemetry);
                        });
                    }
                });

                vehiclesMapController.vehicleAdded.connect(vehicle => { vehiclesView.setVehicle(vehicle.id, vehicle); });
                vehiclesMapController.vehicleChanged.connect(vehicle => { vehiclesView.setVehicle(vehicle.id, vehicle); });
                vehiclesMapController.vehicleRemoved.connect(vehicleId => { vehiclesView.removeVehicle(vehicleId); });
                vehiclesMapController.telemetryChanged.connect((vehicleId, data) => { vehiclesView.setTelemetry(vehicleId, data); });
                vehiclesMapController.trackingChanged.connect(() => { vehiclesView.setTracking(vehiclesMapController.tracking); });

                vehiclesMapController.selectedVehicleChanged.connect(vehicleId => { vehiclesView.selectVehicle(vehicleId); });
                vehiclesView.selectVehicle(vehiclesMapController.selectedVehicleId);

                vehiclesMapController.trackLengthChanged.connect(trackLength => { vehiclesView.setTrackLength(trackLength); });
                vehiclesView.setTrackLength(vehiclesMapController.trackLength);
            }

            var adsbController = channel.objects.adsbController;
            if (adsbController) {
                const adsb = new Adsb(that.viewer);
                adsbController.adsbChanged.connect((data) => { adsb.setData(data); });
            }
            var menuController = channel.objects.menuController;
            if (menuController) {
                that.input.subscribe(InputTypes.ON_CLICK, (event, cartesian, modifier) => {
                    if (Cesium.defined(modifier) || !Cesium.defined(cartesian))
                        return false;

                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                    var altitude = cartographic.height;
                    menuController.invoke(event.position.x, event.position.y,
                                          latitude, longitude, altitude);
                    return true;
                });
                that.viewport.subscribeCamera((heading, pitch, cameraPosition, centerPosition,
                                               pixelScale, changed) => {
                    if (changed)
                        menuController.drop();
                });
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
