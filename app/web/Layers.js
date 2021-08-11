class Layers {
    constructor(cesium, layersController) {

        this.imageryLayers = cesium.viewer.imageryLayers;

        this.layersController = layersController;
        var that = this;

        // signals
        layersController.layersChanged.connect(function() {
            that.reloadLayers();
        });

        layersController.restore();
    }

    clearLayers() {
        this.imageryLayers.removeAll();
    }

    reloadLayers() {
        this.clearLayers();

        this.layersController.layers.forEach(layer => { if (layer.visibility) this.addLayer(layer); });
    }

    addLayer(layer) {
        var provider = new Cesium.UrlTemplateImageryProvider({
            credit: layer.name,
            url: layer.url,
        });

        this.imageryLayers.addImageryProvider(provider);
    }
}
