import QtQuick 2.6
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Adsb 1.0

Item {
    id: root

    AdsbController { id: controller }

    Controls.Button {
        id: button
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: Controls.Theme.margins
        iconSource: "qrc:/icons/adsb.svg"
        tipText: qsTr("Adsb overview")
        highlighted: popup.visible
        onClicked: popup.visible ? popup.close() : popup.open()
    }

    Controls.Popup {
        id: popup

        closePolicy: Controls.Popup.NoAutoClose
        width: Controls.Theme.baseSize * 10
        height: Math.min(implicitHeight, main.height - y - Controls.Theme.baseSize * 2)
        y: button.height + Controls.Theme.margins
        x: button.x
        backgroundOpacity: 0.45
        backgroundColor: "black"

        Widgets.ListWrapper {
            model: controller.adsb
            anchors.fill: parent
            emptyText: qsTr("No ADS-B data")

            delegate: AdsbState {
                width: parent.width
                callsign: modelData[1]
            }
        }
    }
}
