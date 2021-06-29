class CesiumViewport extends IWereViewport {
    constructor(camera) {
        super();

        this.camera = camera;
    }

    goTo(latitude, longitude, height, heading, pitch) {
        this.camera.flyTo({
                destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                orientation : {
                    heading : Cesium.Math.toRadians(heading),
                    pitch : Cesium.Math.toRadians(pitch),
                }
            });
    }
}

class WereCesium {
    constructor(container) {
        // Your access token can be found at: https://cesium.com/ion/tokens.
        // Replace `your_access_token` with your Cesium ion access token.

        //Cesium.Ion.defaultAccessToken = 'your_access_token';

        // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
        this.viewer = new Cesium.Viewer(container, { terrainProvider: Cesium.createWorldTerrain() });
        // Add Cesium OSM Buildings, a global 3D buildings layer.
        const buildingTileset = this.viewer.scene.primitives.add(Cesium.createOsmBuildings());

        this.viewport = new CesiumViewport(this.viewer.camera);
    }
}

