// Register handlers with: onClick(cartesian), onDown(cartesian), onUp(cartesian), onMove(cartesian), onMoveShift(dx, dy), onPick([pickedObjects])
class Input {
    constructor(viewer) {

        this.viewer = viewer;

        this.handlers = new Map();
        this.handlers["onClick"] = [];
        this.handlers["onDoubleClick"] = [];
        this.handlers["onDown"] = [];
        this.handlers["onUp"] = [];
        this.handlers["onMove"] = [];
        this.handlers["onMoveShift"] = [];
        this.handlers["onPick"] = [];

        this.pickRadius = 10;

        var that = this;

        // Remove conflicting default behavior
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.scene.screenSpaceCameraController.enableLook = false;

        // Left button click
        var leftClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftClickHandler.setInputAction((event) => {
            // Promoute mouse click event with position
            that.pickPosition(event.position, cartesian => {
                that.handlers["onClick"].forEach(handler => { handler(cartesian); });
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Left button double click
        var leftDoubleClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftDoubleClickHandler.setInputAction((event) => {
            // Promoute mouse click event with position
            that.pickPosition(event.position, cartesian => {
                that.handlers["onDoubleClick"].forEach(handler => { handler(cartesian); });
            });
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Left button down
        var downCallback = (event) => {
            // Promoute mouse down event with position
            that.pickPosition(event.position, cartesian => {
                that.handlers["onDown"].forEach(handler => { handler(cartesian); });
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
            that.pickPosition(event.position, cartesian => {
                that.handlers["onUp"].forEach(handler => { handler(cartesian); });
            });
        }

        var leftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftUpHandler.setInputAction(upCallback, Cesium.ScreenSpaceEventType.LEFT_UP);
        var leftShiftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftShiftUpHandler.setInputAction(upCallback, Cesium.ScreenSpaceEventType.LEFT_UP,
                                          Cesium.KeyboardEventModifier.SHIFT);

        // Mouse move
        var moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        moveHandler.setInputAction((movement) => {
            // Try to pick entity on map
            that.pickEntity(movement.endPosition);

            // Promoute position for onMove handlers
            that.pickPosition(movement.endPosition, cartesian => {
                that.handlers["onMove"].forEach(handler => { handler(cartesian); });
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Mouse move with shift
        var moveShiftHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        moveShiftHandler.setInputAction((movement) => {
            // Try to pick entity on map
            that.pickEntity(movement.endPosition);

            // Promoute scaled dx/dy for onMoveShift handlers
            var dx = (movement.startPosition.x - movement.endPosition.x) * that.pixelScale;
            var dy = (movement.startPosition.y - movement.endPosition.y) * that.pixelScale;
            that.handlers["onMoveShift"].forEach(handler => { handler(dx, dy); });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.SHIFT);
    }

    pickEntity(position) {
        var pickedObjects = this.viewer.scene.drillPick(position, undefined, this.pickRadius,
                                                        this.pickRadius);
        this.handlers["onPick"].forEach(handler => { handler(pickedObjects); });
    }

    pickPosition(position, callback) {
        // Not work well with disabled depth test
        // callback(this.viewer.scene.pickPosition(event.position));

        var ray = this.viewer.camera.getPickRay(position);
        var intersection = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (intersection)
            callback(intersection);
    }

    subscribe(event, handler) {
        this.handlers[event].push(handler);
    }

    unsubscribe(event, handler) {
        this.handlers[event] = this.handlers[event].filter(item => item !== handler)
    }
}
