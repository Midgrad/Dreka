import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
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

//    Timer {
//        interval: 5000; running: true; repeat: true
//        onTriggered: viewportController.flyTo(55.97101, 37.10610, 400, 0.0, -15.0, 3);
//    }

    RowLayout {
        id: row
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.margins: 15
        spacing: 10

        Button {
            round: true
            flat: true
            iconSource: "../app/icons/compas.svg"
            iconSize: 42
            rotation: viewportController.heading
            onClicked: viewportController.headingTo(0, 1);
        }

        Label {
            id: tools
            visible: viewportController.cursorPosition.valid
            text: "Lat:" + viewportController.cursorPosition.latitude.toFixed(8) + " " +
                  "Lon:" + viewportController.cursorPosition.longitude.toFixed(8)
        }
    }
}
