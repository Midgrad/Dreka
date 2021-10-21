import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

// TODO: expandable
Item {
    id: root

    property var waypoint
    property int waypointIndex: 0

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

        Controls.Button {
            flat: true
            rightCropped: true
            iconSource: "qrc:/icons/center.svg"
            tipText: qsTr("Center on waypoint")
            onClicked: controller.centerWaypoint(mission.id, waypointIndex)
        }

        Controls.Label {
            text: waypoint ? waypoint.name : ""
            Layout.alignment: Qt.AlignVCenter
            Layout.fillWidth: true
        }

        Controls.Label {
            text: waypoint ? waypoint.type : ""
            type: Controls.Theme.Label
            Layout.alignment: Qt.AlignVCenter
        }
    }
}
