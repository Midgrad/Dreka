import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property color color: Controls.Theme.colors.background

    width: Controls.Theme.baseSize
    height: Controls.Theme.baseSize / 2
    clip: true

    Rectangle {
        anchors.centerIn: parent
        anchors.verticalCenterOffset: -parent.height
        width: parent.width
        height: width
        rotation: 45
        color: root.color
    }
}
