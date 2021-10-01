class Draggable {
    constructor(viewer) {
        this.viewer = viewer;

        // Cartesian coordinates
        this.positions = [];

        // Entities
        this.points = [];
        this.hoveredPoint = null;

        // TODO: global drag handling
        this.dragging = false;
    }

    setDragging(dragging) {
        this.dragging = dragging;

        var scene = this.viewer.scene;
        scene.screenSpaceCameraController.enableRotate = !dragging;
        scene.screenSpaceCameraController.enableTranslate = !dragging;
        scene.screenSpaceCameraController.enableZoom = !dragging;
        scene.screenSpaceCameraController.enableTilt = !dragging;
        scene.screenSpaceCameraController.enableLook = !dragging;
    }

    makeHoveredPoint(point) {
        this.hoveredPoint = point;
    }

    dropHoveredPoint() {
        this.hoveredPoint = null;
    }

    onUp(cartesian) {
        this.setDragging(false);
    }

    onDown(cartesian) {
        if (this.hoveredPoint)
            this.setDragging(true);
    }

    onMove(cartesian) {
        // Only in drag mode and with hovered point
        if (!this.dragging || !Cesium.defined(cartesian) || !this.hoveredPoint)
            return -1;

        // Update hovered entity position
        this.hoveredPoint.position = cartesian;

        // Get hovered point index
        var index = this.points.indexOf(this.hoveredPoint);
        if (index === -1)
            return -1;

        // Move point to new place
        this.positions[index] = cartesian;
        return index;
    }

    onPick(pickedObject) {
        if (this.dragging)
            return;

        if (!Cesium.defined(pickedObject)) {
            this.dropHoveredPoint();
            return;
        }

        var point = pickedObject.id;
        if (point === this.hoveredPoint)
            return;

        this.dropHoveredPoint();

        if (this.points.includes(point))
            this.makeHoveredPoint(point);
    }
}
