// Register handlers with: onClick(cartesian), onDown(cartesian), onUp(cartesian), onMove(cartesian), onPick(pickedObject)
class Input {
    constructor(viewer) {

        this.viewer = viewer;
        this.handlers = [];
        this.pixelScale = 0;

        this.pickRadius = 10;

        var that = this;

        // Remove conflicting default behavior
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.scene.screenSpaceCameraController.enableLook = false;

        // Left button click
        var leftClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftClickHandler.setInputAction((event) => {
            // Promoute mouse click event with position
            that.pickPosition(event.position, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onClick === "function")
                        handler.onClick(cartesian);
                });
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Left button down
        var downCallback = (event) => {
            // Promoute mouse down event with position
            that.pickPosition(event.position, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onDown === "function")
                        handler.onDown(cartesian);
                });
            });
        }

        var leftDownHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftDownHandler.setInputAction(downCallback, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        var leftShiftDownHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftShiftDownHandler.setInputAction(downCallback, Cesium.ScreenSpaceEventType.LEFT_DOWN,
                                            Cesium.KeyboardEventModifier.SHIFT);

        // Left button up
        var upCallback = (event) => {
            // Promoute mouse up event with position
            that.pickPosition(event.position, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onUp === "function")
                        handler.onUp(cartesian);
                });
            });
        }

        var leftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftUpHandler.setInputAction(upCallback, Cesium.ScreenSpaceEventType.LEFT_UP);
        var leftShiftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftShiftUpHandler.setInputAction(upCallback, Cesium.ScreenSpaceEventType.LEFT_UP,
                                          Cesium.KeyboardEventModifier.SHIFT);

        // Mouse move
        var moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        moveHandler.setInputAction(function(movement) {
            // Try to pick entity on map
            that.pickEntity(movement.endPosition);

            // Promoute position for onMove handlers
            that.pickPosition(movement.endPosition, function (cartesian) {
                that.handlers.forEach(handler => {
                    if (typeof handler.onMove === "function")
                        handler.onMove(cartesian);
                });
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Mouse move with shift
        var moveShiftHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        moveShiftHandler.setInputAction(function(movement) {
            // Try to pick entity on map
            that.pickEntity(movement.endPosition);

            // Promoute scaled dx/dy for onMoveShift handlers
            var dx = (movement.startPosition.x - movement.endPosition.x) * that.pixelScale;
            var dy = (movement.startPosition.y - movement.endPosition.y) * that.pixelScale;
            that.handlers.forEach(handler => {
                if (typeof handler.onMoveShift === "function")
                    handler.onMoveShift(dx, dy);
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.SHIFT);
    }

    pickEntity(position) {
        var pickedObjects = this.viewer.scene.drillPick(position, undefined, this.pickRadius,
                                                        this.pickRadius);
        var found = false;
        this.handlers.forEach(handler => {
            if (found || typeof handler.onPick !== "function")
                return;

            found = handler.onPick(pickedObjects);
        });
    }

    pickPosition(position, callback) {
        // Not work well with disabled depth test
        // callback(this.viewer.scene.pickPosition(event.position));

        var ray = this.viewer.camera.getPickRay(position);
        var intersection = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (intersection)
            callback(intersection);
    }

    subscribe(handler) {
        this.handlers.push(handler);
    }

    unsubscribe(handler) {
        this.handlers = this.handlers.filter(item => item !== handler)
    }
}
