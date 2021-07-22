import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import QtWebEngine 1.3
import QtWebChannel 1.0
import Dreka 1.0

Item {
    id: root

    MapViewportController {
        id: viewportController
    }

    Component.onCompleted: {
        webChannel.registerObject("viewportController", viewportController);
    }

    Component.onDestruction: {
        viewportController.save();
    }

    WebEngineView {
        anchors.fill: parent
        url: "../../web/index.html"
        webChannel: WebChannel{
            id: webChannel
        }
    }

    MapControl {
        id: row
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.margins: 15
    }
}
