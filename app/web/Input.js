// Register handlers:
//  onClick(cartesian, x, y),
//  onDown(cartesian),
//  onUp(cartesian),
//  onMove(movement),
//  onMoveShift(dx, dy), - TODO: replace with onMove with shift modifier
//  onPick([pickedObjects]) - TODO: replace with onMove
class Input {
    constructor(viewer) {

        this.viewer = viewer;

        this.handlers = new Map();
        this.handlers["onClick"] = [];
        this.handlers["onDown"] = [];
        this.handlers["onUp"] = [];
        this.handlers["onMove"] = [];
        this.handlers["onMoveShift"] = [];
        this.handlers["onPick"] = [];

        this.pickRadius = 10;
        this.hoveredObjects = [];

        var that = this;

        // Remove conflicting default behavior
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.scene.screenSpaceCameraController.enableLook = false;

        // Left button click
        var leftClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftClickHandler.setInputAction((event) => {
            var cartesian = that.pickPosition(event.position);

            var handlers = that.handlers["onClick"];
            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i](cartesian, event.position.x, event.position.y))
                    return;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Left button down
        var downCallback = (event) => {
            var cartesian = that.pickPosition(event.position);

            var handlers = that.handlers["onDown"];
            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i](cartesian))
                    return;
            }
        }

        var leftDownHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftDownHandler.setInputAction(downCallback, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        var leftShiftDownHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftShiftDownHandler.setInputAction(downCallback, Cesium.ScreenSpaceEventType.LEFT_DOWN,
                                            Cesium.KeyboardEventModifier.SHIFT);

        // Left button up
        var upCallback = (event) => {
            var cartesian = that.pickPosition(event.position);

            var handlers = that.handlers["onUp"];
            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i](cartesian))
                    return;
            }
        }

        var leftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftUpHandler.setInputAction(upCallback, Cesium.ScreenSpaceEventType.LEFT_UP);
        var leftShiftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftShiftUpHandler.setInputAction(upCallback, Cesium.ScreenSpaceEventType.LEFT_UP,
                                          Cesium.KeyboardEventModifier.SHIFT);

        // Mouse move
        var moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        moveHandler.setInputAction((movement) => {
            var cartesian = that.pickPosition(movement.endPosition);

            var handlers = that.handlers["onMove"];
            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i](movement, cartesian))
                    return;
            }

            // Try to pick entity on map
            that.pickEntities(movement.endPosition);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Mouse move with shift
        var moveShiftHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        moveShiftHandler.setInputAction((movement) => {
            // Try to pick entity on map
            that.pickEntities(movement.endPosition);

            // Promoute scaled dx/dy for onMoveShift handlers
            var dx = (movement.startPosition.x - movement.endPosition.x) * that.pixelScale;
            var dy = (movement.startPosition.y - movement.endPosition.y) * that.pixelScale;
            that.handlers["onMoveShift"].slice().reverse().forEach(handler => { handler(dx, dy); });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.SHIFT);
    }

    pickEntities(position) {
        // Remember hoveredObjects
        this.hoveredObjects = this.viewer.scene.drillPick(position, undefined,
                                                          this.pickRadius, this.pickRadius);
        // promoute pick event with picked objects
        var handlers = this.handlers["onPick"];
        for (var i = handlers.length - 1; i >= 0; i--) {
            if (handlers[i](this.hoveredObjects))
                break;
        }
    }

    pickPosition(position) {
        var ray = this.viewer.camera.getPickRay(position);
        return this.viewer.scene.globe.pick(ray, this.viewer.scene);
    }

    subscribe(event, handler) {
        this.handlers[event].push(handler);
    }

    unsubscribe(event, handler) {
        this.handlers[event] = this.handlers[event].filter(item => item !== handler)
    }
}
