import QtQuick 2.12
import Industrial.Controls 1.0 as Controls

MapButton {
    id: root

    property real heading: 0
    property real pitch: 0

    implicitHeight: Controls.Theme.baseSize
    tipText: qsTr("North direction,\nclick to reset")

    Controls.ColoredIcon {
        id: icon
        anchors.fill: parent
        anchors.margins: 1
        source: "qrc:/icons/compas.svg"
        rotation: -heading
    }
}
