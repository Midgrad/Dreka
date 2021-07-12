import QtQuick 2.12
import QtQuick.Controls 2.12
import QtWebEngine 1.3
import QtWebChannel 1.0

Item {
    id: root

    Component.onCompleted: {
        webChannel.registerObject("viewportController", viewportController);
    }

    WebEngineView {
        anchors.fill: parent
        url: "../web/index.html"
        webChannel: WebChannel{
            id: webChannel
        }
    }

    Timer {
        interval: 5000; running: true; repeat: true
        onTriggered: viewportController.flyTo(55.97101, 37.10610, 400, 0.0, -15.0, 3);
    }

    Label {
        id: tools
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.margins: 15
        text: "Lat:" + viewportController.cursorLatitude.toFixed(8) + " " +
              "Lon:" + viewportController.cursorLongitude.toFixed(8)
    }
}
