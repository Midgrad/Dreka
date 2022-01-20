class Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;

        // Callbacks
        var that = this;
        input.subscribe(InputTypes.ON_CLICK, (event, cartesian, modifier) => {
            return that.onClick(event, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_DOUBLE_CLICK, (event, cartesian, modifier) => {
            return that.onDoubleClick(event, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_UP, (event, cartesian, modifier) => {
            return that.onUp(event, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_DOWN, (event, cartesian, modifier) => {
            return that.onDown(event, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_MOVE, (event, cartesian, modifier) => {
            return that.onMove(event, cartesian, modifier);
        });
        input.subscribe(InputTypes.ON_PICK, objects => { return that.onPick(objects); });

        // Data
        this.dragging = false;
    }

    setDragging(dragging) {
        this.dragging = dragging;

        var scene = this.viewer.scene;
        scene.screenSpaceCameraController.enableRotate = !dragging;
        scene.screenSpaceCameraController.enableTranslate = !dragging;
        scene.screenSpaceCameraController.enableZoom = !dragging;
        scene.screenSpaceCameraController.enableTilt = !dragging;
    }

    onClick(event, cartesian, modifier) { return false; }
    onDoubleClick(event, cartesian, modifier) { return false; }
    onUp(event, cartesian, modifier) { return false; }
    onDown(event, cartesian, modifier) { return false; }
    onMove(event, cartesian, modifier) { return false; }
    onPick(objects) { return false; }
}
