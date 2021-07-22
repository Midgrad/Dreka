import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property real lineWidth: 2
    property real metersInPixel: 1
    property real metersInWidth: metersInPixel * width
    property real metersRounded: Controls.Helper.roundTo125(metersInWidth)
    property color color: Controls.Theme.colors.text

    implicitWidth: Controls.Theme.baseSize * 4
    implicitHeight: Controls.Theme.baseSize * 0.5

    Item {
        id: item
        anchors.fill: parent

        Rectangle {
            anchors { left: parent.left; right: parent.right; bottom: parent.bottom}
            height: root.lineWidth
            color: root.color
        }

        Rectangle {
            id: leftTick
            height: root.height
            width: root.lineWidth
            color: root.color
        }

        Rectangle {
            id: roundedTick
            x: root.width * metersRounded / metersInWidth
            height: root.height
            width: root.lineWidth
            color: root.color

            Behavior on x { PropertyAnimation { duration: 100 } }
        }

        Text {
            anchors.left: leftTick.right
            anchors.right: roundedTick.left
            height: parent.height
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
            font.bold: true
            font.pixelSize: Controls.Theme.auxFontSize
            color: root.color
            text: metersRounded > 1000 ? (Math.round(metersRounded / 1000) + " " + qsTr("km")):
                                         (Math.round(metersRounded) + " " + qsTr("m"))
        }
    }
}
