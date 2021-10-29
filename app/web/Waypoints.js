class Waypoint extends Draggable {
    /**
     * @param {Cesium.Viewr} viewer
     * @param {JSON} waypointData
     * @param {Cesium.Color} color
     */
    constructor(viewer, waypointData, color = Cesium.Color.WHITE) {
        super(viewer);

        // Data
        var params = waypointData.params;
        this.position = Cesium.Cartographic.fromDegrees(params.longitude, params.latitude, params.altitude);
        this.terrainPosition = Cesium.Cartographic.fromDegrees(params.longitude, params.latitude, 0);

        // Update terrainPosition from the terrainProvider
        var promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [this.terrainPosition]);
        Cesium.when(promise, updatedPositions => {});

        // Visual
        this.normalScale = 1.0;
        this.hoveredScale = 1.2;
        // this.visible = true;

        var that = this;

        // SVG billboard with label
        this.point = viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
                return Cesium.Cartographic.toCartesian(that.position)
            }, false),
            billboard: {
                image: "./icons/wpt.svg",
                color: color,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                scale: this.normalScale
            },
            label: {
                text: waypointData.name,
                show: false,
                showBackground: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                pixelOffset: new Cesium.Cartesian2(0, -25),
                font: "13px Helvetica"
            }
        });

        // Dash line to the terrain
        this.pylon = this.viewer.entities.add({
             polyline: {
                 positions: new Cesium.CallbackProperty(() => {
                     return [Cesium.Cartographic.toCartesian(that.position),
                             Cesium.Cartographic.toCartesian(that.terrainPosition)];
                 }, false),
                 width: 1,
                 arcType: Cesium.ArcType.NONE,
                 material: new Cesium.PolylineDashMaterialProperty(Cesium.Color.GAINSBORO)
             }
        });

        // Draggable point on the ground
        this.groundPoint = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(() => {
                return Cesium.Cartographic.toCartesian(that.terrainPosition)
            }, false),
            show: false,
            point: {
                pixelSize: this.pointPixelSize,
                color: Cesium.Color.CADETBLUE
            }
        });
    }

    /**
     * @param {JSON} waypointData - JSON, must contain latitude, longitude, altitude (AMSL)
     */
    update(waypointData) {
        var params = waypointData.params;

        this.point.label.text = waypointData.name;

        this.position = Cesium.Cartographic.fromDegrees(params.longitude, params.latitude, params.altitude);
        this.terrainPosition = Cesium.Cartographic.fromDegrees(params.longitude, params.latitude, 0);

        // Update terrainPosition from the terrainProvider
        var promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [this.terrainPosition]);
        Cesium.when(promise, updatedPositions => {});
    }

    clear() {
        this.viewer.entities.remove(this.point);
        this.viewer.entities.remove(this.pylon);
        this.viewer.entities.remove(this.groundPoint);
    }

    flyTo() {
        this.viewer.flyTo(this.point);
    }

    setEditMode(edit) {
        this.point.label.show = edit;
        this.groundPoint.show = edit;
    }
}
