class Layers {
    constructor(cesium, layersController) {

        this.imageryLayers = cesium.viewer.imageryLayers;

//        var cartoDB = new Cesium.UrlTemplateImageryProvider({
//            url : 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
//        });

//        var esri = new Cesium.UrlTemplateImageryProvider({
//            url : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
//        });

//        var google = new Cesium.UrlTemplateImageryProvider({
//            url : 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}'
//        });

//        this.imageryLayers.addImageryProvider(google);

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
