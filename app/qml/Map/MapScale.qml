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
    implicitHeight: Controls.Theme.baseSize

    Rectangle {
        anchors.fill: parent
        radius: Controls.Theme.rounding
        color: Controls.Theme.colors.background
    }

    Text {
        anchors.top: parent.top
        anchors.horizontalCenter: parent.horizontalCenter

        visible: metersInPixel > 0
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        font.bold: true
        font.pixelSize: Controls.Theme.auxFontSize
        color: root.color
        text: metersRounded > 1000 ? (Math.round(metersRounded / 1000) + " " + qsTr("km")):
                                     (Math.round(metersRounded) + " " + qsTr("m"))
    }

    Item {
        id: scale
        anchors.fill: parent
        anchors.topMargin: root.height / 2

        Rectangle {
            anchors { left: parent.left; right: parent.right; bottom: parent.bottom}
            height: root.lineWidth
            color: root.color
        }

        Rectangle {
            id: leftTick
            height: scale.height
            width: root.lineWidth
            color: root.color
        }

        Rectangle {
            id: roundedTick
            x: root.width * metersRounded / metersInWidth
            height: scale.height
            width: root.lineWidth
            visible: metersInPixel > 0
            color: root.color

            Behavior on x { PropertyAnimation { duration: 100 } }
        }
    }
}
