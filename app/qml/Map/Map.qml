import QtQuick 2.12
import QtQuick.Layouts 1.12
import QtWebEngine 1.3
import QtWebChannel 1.0
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Item {
    id: root

    MapViewportController {
        id: viewport
    }

    MapRulerController {
        id: ruler
    }

    Component.onCompleted: {
        webChannel.registerObject("viewportController", viewport);
        webChannel.registerObject("rulerController", ruler);
    }

    Component.onDestruction: {
        viewport.save();
    }

    WebEngineView {
        anchors.fill: parent
        url: "../../web/index.html"
        webChannel: WebChannel{
            id: webChannel
        }
    }

    MapControl {
        id: mapControl
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.margins: Controls.Theme.margins
    }
}
