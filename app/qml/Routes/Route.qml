import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var route

    signal expand()

    implicitWidth: row.implicitWidth
    implicitHeight: Controls.Theme.baseSize

    Rectangle {
        id: hover
        anchors.fill: parent
        opacity: 0.20
        color: mouseArea.containsMouse ? Controls.Theme.colors.highlight : "transparent"
        radius: Controls.Theme.rounding
    }

    MouseArea {
        id: mouseArea
        hoverEnabled: true
        anchors.fill: parent
        onClicked: expand()
    }

    RowLayout {
        id: row
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        Controls.Label {
            text: route ? route.name : ""
            Layout.alignment: Qt.AlignVCenter
        }
// TODO: assigned routes
//        Controls.Label {
//            text: mission ? mission.vehicle : ""
//            type: Controls.Theme.Label
//            Layout.alignment: Qt.AlignVCenter
//        }

        Item { Layout.fillWidth: true }

        Controls.Button {
            flat: true
            radius: 0
            iconSource: "qrc:/icons/center.svg"
            tipText: qsTr("Center on route")
            onClicked: controller.centerRoute(route.id)
            Layout.alignment: Qt.AlignVCenter
        }

        Controls.ColoredIcon {
            implicitWidth: Controls.Theme.iconSize
            implicitHeight: width
            source: "qrc:/icons/right.svg"
            Layout.alignment: Qt.AlignVCenter
            Layout.rightMargin: Controls.Theme.padding
        }
    }
}
