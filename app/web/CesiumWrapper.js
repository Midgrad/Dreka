class CesiumWrapper {
    constructor(container, viewportController) {
        // Your access token can be found at: https://cesium.com/ion/tokens.
        // Replace `your_access_token` with your Cesium ion access token.
        // --> Cesium.Ion.defaultAccessToken = 'your_access_token';

        // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
        const viewer = new Cesium.Viewer(container, { terrainProvider: Cesium.createWorldTerrain() });
        // Add Cesium OSM Buildings, a global 3D buildings layer.
        const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

        // stuff to get meters in pixel
        var getViewExtent = function() {
            var camera = viewer.scene.camera;
            var canvas = viewer.scene.canvas;
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var corners = [
                camera.pickEllipsoid( new Cesium.Cartesian2( 0, 0 ), ellipsoid ),
                camera.pickEllipsoid( new Cesium.Cartesian2( canvas.width, 0 ), ellipsoid ),
                camera.pickEllipsoid( new Cesium.Cartesian2( 0, canvas.height ), ellipsoid ),
                camera.pickEllipsoid( new Cesium.Cartesian2( canvas.width, canvas.height ), ellipsoid )
            ];
            var extents = false;
            for( var index = 0; index < 4; index++ ) {
                if( corners[ index ] === undefined ) {
                    return Cesium.Rectangle.MAX_VALUE;
                }
            }
            return Cesium.Rectangle.fromCartographicArray( ellipsoid.cartesianArrayToCartographicArray( corners ) );
        };

        // signals
        viewportController.flyTo.connect(function(latitude, longitude, height, heading, pitch, duration) {
            viewer.camera.flyTo({
                         destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                         orientation : {
                             heading : Cesium.Math.toRadians(heading),
                             pitch : Cesium.Math.toRadians(pitch),
                             roll : 0
                         },
                         duration: duration
                     });
        });

        viewportController.lookTo.connect(function(heading, pitch, duration) {
            viewer.camera.flyTo({
                         destination : viewer.camera.positionWC,
                         orientation : {
                             heading : Cesium.Math.toRadians(heading),
                             pitch : Cesium.Math.toRadians(pitch),
                             roll : viewer.camera.roll
                         },
                         duration: duration
                     });
        });

         // event listners
        viewer.scene.canvas.addEventListener('mousemove', function(event) {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            // Mouse over the globe to see the cartographic position
            var cartesian = viewer.camera.pickEllipsoid(
                        new Cesium.Cartesian3(event.clientX, event.clientY), ellipsoid);
            if (cartesian) {
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);

                viewportController.cursorPosition.latitude = Cesium.Math.toDegrees(cartographic.latitude);
                viewportController.cursorPosition.longitude = Cesium.Math.toDegrees(cartographic.longitude);
                // viewportController.cursorHeight = cartographic.height;
            } else {
                viewportController.cursorPosition.invalidate();
            }

            var rect = getViewExtent();

            if (!rect.equals( Cesium.Rectangle.MAX_VALUE)) {
                var canvas = viewer.scene.canvas;
                var diffHeight = ( rect.north > rect.south ) ? rect.north - rect.south : rect.south - rect.north;
                var kmPerPixel = ( diffHeight * 6355.3 ) / canvas.clientHeight;
                viewportController.metersInPixel = kmPerPixel * 1000.0;
            }
        });

        viewer.scene.postRender.addEventListener(function(){
          viewportController.heading = Cesium.Math.toDegrees(viewer.camera.heading);
          viewportController.pitch = Cesium.Math.toDegrees(viewer.camera.pitch);
        })
    }
}

const webChannel = new QWebChannel(qt.webChannelTransport, function(channel) {
    const viewportController = channel.objects.viewportController;
    const cesium = new CesiumWrapper('cesiumContainer', viewportController);
});
