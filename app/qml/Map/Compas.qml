import QtQuick 2.12
import Industrial.Controls 1.0 as Controls

Controls.Button {
    id: root

    property real heading: 0
    property real pitch: 0

    round: true
    backgroundOpacity: 0.25
    implicitHeight: Controls.Theme.baseSize * 1.5

    Controls.ColoredIcon {
        id: icon
        anchors.fill: parent
        anchors.margins: Controls.Theme.padding
        source: "../app/icons/compas.svg"
        rotation: heading
        transform: Rotation {
            origin.x: icon.width / 2;
            origin.y: icon.height / 2;
            axis { x: 1; y: 0; z: 0 }
            angle: 90 - pitch
        }
    }


}
