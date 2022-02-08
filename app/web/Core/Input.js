/**
 * InputTypes defines types of input events
 *
 * @enum {Number}
 */
var InputTypes = {
    NONE: 0,
    ON_CLICK: 1,
    ON_DOWN: 2,
    ON_UP: 3,
    ON_MOVE: 4
};
Object.freeze(InputTypes);

class Input { /// FIXME: remove double click
    constructor(viewer) {
        this.viewer = viewer;

        // Callbacks
        this.listeners = new Map();
        this.listeners[InputTypes.ON_CLICK] = [];
        this.listeners[InputTypes.ON_DOWN] = [];
        this.listeners[InputTypes.ON_UP] = [];
        this.listeners[InputTypes.ON_MOVE] = [];

        // Data
        this.handlers = [];

        // Remove conflicting default behavior
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK,
                                                              Cesium.KeyboardEventModifier.CTRL);
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE,
                                                              Cesium.KeyboardEventModifier.CTRL);
        this.viewer.scene.screenSpaceCameraController.enableLook = false;

        // Lambda function to handle all input listeners
        var that = this;
        this.lambda = (event, inputType, modifier) => {
            var cartesian = undefined;
            if (Cesium.defined(event.position))
                cartesian = that._pickPosition(event.position);
            else if (Cesium.defined(event.endPosition))
                cartesian = that._pickPosition(event.endPosition);

            for (const listener of that.listeners[inputType]) {
                if (listener(event, cartesian, modifier))
                    return;
            }
        };

        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_CLICK, InputTypes.ON_CLICK, undefined);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_CLICK, InputTypes.ON_CLICK, Cesium.KeyboardEventModifier.SHIFT);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_CLICK, InputTypes.ON_CLICK, Cesium.KeyboardEventModifier.CTRL);

        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_DOWN, InputTypes.ON_DOWN, undefined);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_DOWN, InputTypes.ON_DOWN, Cesium.KeyboardEventModifier.SHIFT);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_DOWN, InputTypes.ON_DOWN, Cesium.KeyboardEventModifier.CTRL);

        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_UP, InputTypes.ON_UP, undefined);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_UP, InputTypes.ON_UP, Cesium.KeyboardEventModifier.SHIFT);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_UP, InputTypes.ON_UP, Cesium.KeyboardEventModifier.CTRL);

        this._addHandler(Cesium.ScreenSpaceEventType.MOUSE_MOVE, InputTypes.ON_MOVE, undefined);
        this._addHandler(Cesium.ScreenSpaceEventType.MOUSE_MOVE, InputTypes.ON_MOVE, Cesium.KeyboardEventModifier.SHIFT);
        this._addHandler(Cesium.ScreenSpaceEventType.MOUSE_MOVE, InputTypes.ON_MOVE, Cesium.KeyboardEventModifier.CTRL);
    }

    _addHandler(eventType, inputType, modifier) {
        var that = this;
        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        handler.setInputAction(event => { that.lambda(event, inputType, modifier); }, eventType, modifier);
        this.handlers.push(handler);
    }

    _pickPosition(position) {
        var ray = this.viewer.camera.getPickRay(position);
        return this.viewer.scene.globe.pick(ray, this.viewer.scene);
    }

    subscribe(inputType, listener) {
        this.listeners[inputType].push(listener);
    }

    unsubscribe(inputType, listener) {
        this.listeners[inputType] = this.listeners[inputType].filter(item => item !== listener)
    }
}
