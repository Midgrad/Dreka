import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var waypoint
    property int waypointIndex: 0

    Connections {
        target: controller
        onWaypointChanged: if (route.id === routeId && waypointIndex === index)
                               waypoint = controller.waypointData(route.id, waypointIndex)
    }

    implicitWidth: row.implicitWidth
    implicitHeight: row.implicitHeight

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
        onClicked: controller.centerWaypoint(route.id, waypointIndex)
    }

    RowLayout {
        id: row
        anchors.fill: parent
        spacing: 0

        Controls.Label {
            text: waypoint ? waypoint.name + " " + (waypointIndex + 1) : ""
            Layout.minimumWidth: _wptWidth
        }

        Controls.Label {
            text: waypoint ? waypoint.type : ""
            type: Controls.Theme.Label
            Layout.minimumWidth: _typeWidth
        }

        Controls.Label {
            text: waypoint && waypoint.calcData && waypoint.calcData.distance ?
                      (Math.round(waypoint.calcData.distance) + " " + qsTr("m")) : "-"
            Layout.minimumWidth: _dstWidth
        }

        Controls.Label {
            text: waypoint ? (Math.round(waypoint.params.altitude) + " " + qsTr("m")) : "-"
            Layout.minimumWidth: _altWidth
        }
    }
}
