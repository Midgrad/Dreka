import QtQuick 2.6
import QtQuick.Controls 2.12
import QtWebEngine 1.0

ApplicationWindow {
    id: main

    visible: true
    width: 1024
    height: 800

    WebEngineView {
        anchors.fill: parent
        url: "https://cesium.com/cesiumjs/cesium-viewer/"
    }
}
