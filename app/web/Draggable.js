class Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;

        var that = this;
        // Callbacks
        input.subscribe("onPick", objects => { return that.onPick(objects); });
        input.subscribe("onUp", cartesian => { return that.onUp(cartesian); });
        input.subscribe("onDown", cartesian => { return that.onDown(cartesian); });
        input.subscribe("onMove", (movement, cartesian) => { return that.onMove(movement, cartesian); });

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

    onPick(objects) { return false; }
    onUp(cartesian) { return false; }
    onDown(cartesian) { return false; }
    onMove(movement, cartesian) { return false; }
}
