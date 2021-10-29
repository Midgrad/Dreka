// TODO: to сommon
function intermediate(first, second) {
    var scratch = new Cesium.Cartesian3();

    var difference = Cesium.Cartesian3.subtract(first, second, scratch);
    var distance = -0.5 * Cesium.Cartesian3.magnitude(difference);
    var direction = Cesium.Cartesian3.normalize(difference, scratch);

    return Cesium.Cartesian3.add(first, Cesium.Cartesian3.multiplyByScalar(
                                        direction, distance, scratch), scratch);
}

class Draggable {
    /**
     * @param {Cesium.Viewr} viewer
     */
    constructor(viewer) {
        this.viewer = viewer;

        // Data
        this.dragging = false;

        // Visual
        this.pointPixelSize = 8.0;
        this.hoveredPointPixelSize = 16.0;
    }

    setDragging(dragging) {
        this.dragging = dragging;

        var scene = this.viewer.scene;
        scene.screenSpaceCameraController.enableRotate = !dragging;
        scene.screenSpaceCameraController.enableTranslate = !dragging;
        scene.screenSpaceCameraController.enableZoom = !dragging;
        scene.screenSpaceCameraController.enableTilt = !dragging;
    }
}


