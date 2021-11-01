// TODO: to сommon
function intermediate(first, second) {
    var scratch = new Cesium.Cartesian3();

    var difference = Cesium.Cartesian3.subtract(first, second, scratch);
    var distance = -0.5 * Cesium.Cartesian3.magnitude(difference);
    var direction = Cesium.Cartesian3.normalize(difference, scratch);

    return Cesium.Cartesian3.add(first, Cesium.Cartesian3.multiplyByScalar(
                                        direction, distance, scratch), scratch);
}

class DraggablePoint {
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

    setHovered(hovered) {
        console.log("You must impl setHovered(hovered) for your class")
    }

    checkMatch(objects) {
        console.log("You must impl checkMatch(objects) for your class")
    }
}

class Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     */
    constructor(viewer, input) {
        this.viewer = viewer;

        // Entities
        this.hoveredPoint = null;

        // Subscribe for input
        input.subscribe(this);
    }

    setHoveredPoint(hoveredPoint) {
        if (this.hoveredPoint === hoveredPoint)
            return;

        if (this.hoveredPoint) {
            this.hoveredPoint.setHovered(false);
        }
        this.hoveredPoint = hoveredPoint;

        if (hoveredPoint) {
            hoveredPoint.setHovered(true);
        }
    }

    onPick(pickedObjects) {
        if (this.hoveredPoint) {
            // Continue if we picking the same or dragging
            if (this.hoveredPoint.dragging ||
                pickedObjects.includes(this.hoveredPoint.point.id))
                return true;

            // Drop it if no
            this.setHoveredPoint(null);
        }

        return false;
    }

    onUp(cartesian) {
        if (this.hoveredPoint && this.hoveredPoint.dragging)
            this.hoveredPoint.setDragging(false);
    }

    onDown(cartesian) {
        if (this.hoveredPoint && !this.hoveredPoint.dragging)
            this.hoveredPoint.setDragging(true);
    }
}
