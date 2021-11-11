import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Item {
    id: root

    signal centerWaypoint(var routeId, int index)

    WaypointController {
        id: controller
        onInvokeMenu: waypointMenu.popup(x, y)
    }

    Component.onCompleted: map.registerController("waypointController", controller)

    Controls.Menu {
        id: waypointMenu
        title: qsTr("Edit Waypoint")

        Controls.MenuItem {
            text: qsTr("Goto")
            enabled: false // TODO: wpt in mission
            onTriggered: console.log("Go to waypint") // TODO:
        }

        Controls.MenuItem {
            text: qsTr("Parameters")
            onTriggered: waypointEdit.open()
        }

        Controls.MenuItem {
            text: qsTr("Remove")
            onTriggered: controller.remove()
        }
    }

    WaypointEdit {
        id: waypointEdit
        x: waypointMenu.x
        y: waypointMenu.y
        waypoint: controller.waypoint
        waypointIndex: controller.waypointIndex
        height: Math.min(implicitHeight, root.height - map.controlHeight - waypointMenu.y)
        onWaypointIndexChanged: {
            if (waypoint && waypointEdit.visible)
                centerWaypoint(waypoint.route, waypointIndex);
        }
    }
}
