class TerrainPoint extends Interactable {
    /**
     * @param {Cesium.Viewer} viewer
       @param {Interaction} interaction
     * @param {Cesium.Cartesian} position
     */
    constructor(viewer, interaction, position, pointColor = Cesium.Color.WHITE) {
        super(interaction);

        var that = this;

        // Callbacks
        this.updateCallback = null;
        this.deleteCallback = null;

        // Data
        this.viewer = viewer;
        this.position = position;

        // Visual
        this.pointPixelSize = 8.0;
        this.hoveredPointPixelSize = 12.0;
        this.selectedPointPixelSize = 16.0;

        // Interactable point
        this.point = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => { return that.position }, false),
            point: {
                pixelSize: new Cesium.CallbackProperty(() => { return that.selected ?
                                                               that.selectedPointPixelSize :
                                                               that.hovered || that.dragging ?
                                                               that.hoveredPointPixelSize :
                                                               that.pointPixelSize; }, false),
                color: pointColor
            }
        });
    }

    clear() {
        this.viewer.entities.remove(this.point);
    }

    selfClick(modifier) {
        if (this.deleteCallback) {
            this.deleteCallback();
            return true;
        }
        return false;
    }

    drag(position, cartesian, modifier) {
        this.position = cartesian;
        if (this.updateCallback)
            this.updateCallback();
        return true;
    }

    matchInteraction(objects) {
        return objects.find(object => { return object.id === this.point });
    }
}
