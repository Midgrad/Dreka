class TerrainPoint extends Draggable {
    /**
     * @param {Cesium.Viewr} viewer
       @param {Input} input
     * @param {Cesium.Cartesian} position
     */
    constructor(viewer, input, position, pointColor = Cesium.Color.WHITE) {
        super(viewer, input);

        var that = this;

        // Callbacks
        this.updateCallback = null;

        // Data
        this.position = position;
        this.enabled = false;
        this.hovered = true;

        // Visual
        this.pointPixelSize = 8.0;
        this.hoveredPointPixelSize = 16.0;

        // Draggable point
        this.point = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position }, false),
            point: {
                pixelSize: new Cesium.CallbackProperty(() => { return that.hovered ?
                                                               that.hoveredPointPixelSize :
                                                               that.pointPixelSize; }, false),
                color: pointColor
            }
        });
    }

    clear() {
        this.viewer.entities.remove(this.point);
    }

    onUp(event, cartesian, modifier) {
        if (this.dragging) {
            this.setDragging(false);
            return true;
        }
        return false;
    }

    onDown(event, cartesian, modifier) {
        if (this.hovered) {
            this.setDragging(true);
            return true;
        }
        return false;
    }

    onMove(event, cartesian, modifier) {
        if (this.dragging && Cesium.defined(cartesian)) {
            this.position = cartesian;
            if (this.updateCallback)
                this.updateCallback();
            return true;
        }
        return false;
    }

    onPick(objects) {
        if (!this.enabled)
            return false;

        var result = null;
        objects.forEach(object => {
            if (this.point === object.id)
            result = this.point;
        });

        this.hovered = result;
        return result;
    }
}
