import QtQuick 2.12
import QtQuick.Controls 2.12
import QtWebEngine 1.3
import QtWebChannel 1.0

ApplicationWindow {
    id: main

    visible: true
    width: 1280
    height: 768

    WebChannel{
        id: webChannel
    }

    WebEngineView {
        anchors.fill: parent
        url: "../web/index.html"
        webChannel: webChannel
    }

    Component.onCompleted: {
        webChannel.registerObject("viewportController", viewportController);
    }

    Timer {
        interval: 5000; running: true; repeat: true
        onTriggered: viewportController.flyTo(55.97101, 37.10610, 400, 0.0, -15.0);
    }

    Label {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.margins: 15
        text: "Lat:" + viewportController.cursorLatitude.toFixed(8) + " " +
              "Lon:" + viewportController.cursorLongitude.toFixed(8)
    }
}
