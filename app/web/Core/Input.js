/**
 * InputTypes defines types of input events
 *
 * @enum {Number}
 */
var InputTypes = {
    NONE: 0,
    ON_CLICK: 1,
    ON_DOUBLE_CLICK: 2,
    ON_DOWN: 3,
    ON_UP: 4,
    ON_MOVE: 5,
    ON_PICK: 6
};
Object.freeze(InputTypes);

/**
 * Input subscribe listeners:
 * ON_CLICK ON_DOWN ON_UP ON_MOVE with interface f(event, cartesian, modifier) => bool
 * ON_PICK with interface f(hoveredObjects) => bool
 *
 * @enum {Number}
 */
class Input {
    constructor(viewer) {
        this.viewer = viewer;

        // Callbacks
        this.listeners = new Map();
        this.listeners[InputTypes.ON_CLICK] = [];
        this.listeners[InputTypes.ON_DOUBLE_CLICK] = [];
        this.listeners[InputTypes.ON_DOWN] = [];
        this.listeners[InputTypes.ON_UP] = [];
        this.listeners[InputTypes.ON_MOVE] = [];
        this.listeners[InputTypes.ON_PICK] = [];

        // Data
        this.pickingRadius = 10;
        this.clickInterval = 200;
        this.hoveredObjects = [];
        this.handlers = [];
        this.timer = null;

        // Remove conflicting default behavior
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK, Cesium.KeyboardEventModifier.CTRL);
        this.viewer.scene.screenSpaceCameraController.enableLook = false;

        // Lambda function to handle all input listeners
        var that = this;
        this.lambda = (event, inputType, modifier) => {
            var cartesian = undefined;
            if (Cesium.defined(event.position)) {
                that._pickEntities(event.position);
                cartesian = that._pickPosition(event.position);
            }
            else if (Cesium.defined(event.endPosition)) {
                that._pickEntities(event.endPosition);
                cartesian = that._pickPosition(event.endPosition);
            }

            var listeners = that.listeners[inputType];
            for (var i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i](event, cartesian, modifier))
                    return;
            }
        };

        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_CLICK, InputTypes.ON_CLICK, undefined, true);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_CLICK, InputTypes.ON_CLICK, Cesium.KeyboardEventModifier.SHIFT, true);
        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_CLICK, InputTypes.ON_CLICK, Cesium.KeyboardEventModifier.CTRL, true);

        this._addHandler(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, InputTypes.ON_DOUBLE_CLICK, undefined, false);

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

    _addHandler(eventType, inputType, modifier, timed = undefined) {
        var that = this;
        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        handler.setInputAction(event => {
            if (that.timer && timed !== undefined)
                clearInterval(that.timer);

            if (timed === true) {
                that.timer = setInterval(function () {
                    clearInterval(that.timer);
                    that.lambda(event, inputType, modifier);
                }, that.clickInterval);
            } else {
                that.lambda(event, inputType, modifier);
            }
        }, eventType, modifier);
        this.handlers.push(handler);
    }

    _pickEntities(position) {
        // Remember hoveredObjects
        this.hoveredObjects = this.viewer.scene.drillPick(position, undefined,
                                                          this.pickingRadius, this.pickingRadius);
        // promoute pick event with picked objects
        var listeners = this.listeners[InputTypes.ON_PICK];
        for (var i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i](this.hoveredObjects))
                return true;
        }
        return false;
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