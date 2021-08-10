// Register handlers with: onClick(cartesian), onDown(cartesian), onUp(cartesian), onMove(cartesian), onPick(pickedObject)
class Input {
    constructor(cesium) {

        this.viewer = cesium.viewer;
        this.handlers = [];

        var that = this;
        var scene = this.viewer.scene;

        // Remove double click on (or near of) an entity
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Left button click
        var leftClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftClickHandler.setInputAction(function(event) {
            // Promoute mouse click event with position
            var cartesian = that.viewer.scene.pickPosition(event.position);
            that.handlers.forEach(handler => {
                if (typeof handler.onClick === "function")
                    handler.onClick(cartesian);
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Left button down
        var leftDownHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftDownHandler.setInputAction(function(event) {
            // Promoute mouse down event with position
            var cartesian = that.viewer.scene.pickPosition(event.position);
            that.handlers.forEach(handler => {
                if (typeof handler.onDown === "function")
                    handler.onDown(cartesian);
            });
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        // Left button up
        var leftUpHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        leftUpHandler.setInputAction(function(event) {
            // Promoute mouse up event with position
            var cartesian = that.viewer.scene.pickPosition(event.position);
            that.handlers.forEach(handler => {
                if (typeof handler.onUp === "function")
                    handler.onUp(cartesian);
            });
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // Mouse move
        var moveHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        moveHandler.setInputAction(function(movement) {
            // Try to pick entity on map
            var pickedObject = scene.pick(movement.endPosition);
            that.handlers.forEach(handler => {
                if (typeof handler.onPick === "function")
                    handler.onPick(pickedObject);
            });
            // Don't pick nan position after picking entity
            if (Cesium.defined(pickedObject)) return;

            // Promoute mouse move event with position
            var cartesian = that.viewer.scene.pickPosition(movement.endPosition);
            that.handlers.forEach(handler => {
                if (typeof handler.onMove === "function")
                    handler.onMove(cartesian);
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    registerHandler(handler) {
        this.handlers.push(handler);
    }

    unregisterHandler(handler) {
        this.handlers = this.handlers.filter(item => item !== handler)
    }
}
