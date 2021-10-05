// Register handlers with: onClick(cartesian), onDown(cartesian), onUp(cartesian), onMove(cartesian), onPick(pickedObject)
class Input {
    constructor(cesium) {

        this.viewer = cesium.viewer;
        this.handlers = [];

        this.pickRadius = 10;

        var that = this;
        var scene = this.viewer.scene;

        // Remove double click on (or near of) an entity
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Left button click
        var leftClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftClickHandler.setInputAction(function(event) {
            // Promoute mouse click event with position
            that.pickPosition(event.position, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onClick === "function")
                        handler.onClick(cartesian);
                });
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Left button down
        var leftDownHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftDownHandler.setInputAction(function(event) {
            // Promoute mouse down event with position
            that.pickPosition(event.position, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onDown === "function")
                        handler.onDown(cartesian);
                });
            });
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        // Left button up
        var leftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftUpHandler.setInputAction(function(event) {
            // Promoute mouse up event with position
            that.pickPosition(event.position, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onUp === "function")
                        handler.onUp(cartesian);
                });
            });
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // Mouse move
        var moveHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        moveHandler.setInputAction(function(movement) {
            // Try to pick entity on map
            var pickedObjects = scene.drillPick(movement.endPosition, undefined,
                                                that.pickRadius, that.pickRadius);
            var found = false;
            that.handlers.forEach(handler => {
                if (found || typeof handler.onPick !== "function")
                    return;

                found = handler.onPick(pickedObjects);
            });

            // Promoute mouse move event with position
            that.pickPosition(movement.endPosition, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onMove === "function")
                        handler.onMove(cartesian);
                });
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    pickPosition(position, callback) {
        // Not work well with disabled depth test
        // callback(this.viewer.scene.pickPosition(event.position));

        var ray = this.viewer.camera.getPickRay(position);
        var intersection = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (intersection) callback(intersection);
    }

    subscribe(handler) {
        this.handlers.push(handler);
    }

    unsubscribe(handler) {
        this.handlers = this.handlers.filter(item => item !== handler)
    }
}
