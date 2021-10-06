class Draggable {
    constructor(viewer) {
        this.viewer = viewer;

        // Visual
        this.pointPixelSize = 8.0;
        this.hoveredPointPixelSize = 16.0;

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
    }

    makeHoveredPoint(point) {
        point.point.pixelSize = this.hoveredPointPixelSize;
        this.hoveredPoint = point;
    }

    dropHoveredPoint() {
        this.hoveredPoint.point.pixelSize = this.pointPixelSize;
        this.hoveredPoint = null;
    }

    clear() {
        for (var i = 0; i < this.points.length; ++i) {
            this.viewer.entities.remove(this.points[i]);
        }
        this.points = [];
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

        return index;
    }

    onPick(pickedObjects) {
        if (this.dragging)
            return true;

        // Find candidate for picking
        var candidate = null;
        pickedObjects.forEach(pickedObject => {
            var point = pickedObject.id;
            if (this.points.includes(point))
                candidate = point;
        });

        // Do nothing if same
        if (candidate === this.hoveredPoint)
            return candidate;

        // Drop oldone
        if (this.hoveredPoint)
            this.dropHoveredPoint();

        if (candidate) {
            this.makeHoveredPoint(candidate);
            return true;
        }
        return false;
    }
}
