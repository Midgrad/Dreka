import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Item {
    id: root

    signal centerWaypoint(var routeId, int index)

    WaypointController {
        id: controller
        onCloseEditor: if (editor.sourceComponent) editor.close();
        onInvokeMenu: menu.open(x, y)
        onUpdatePosition: {
            if (menu.menuVisible)
                menu.move(x, y)
            else if (editor.sourceComponent)
                editor.move(x, y)
        }
    }

    Connections {
        target: mapMenu
        onMenuVisibleChanged: if (mapMenu.menuVisible) if (editor.sourceComponent) editor.close();
    }

    Component.onCompleted: map.registerController("waypointController", controller)

    PointedMenu {
        id: menu
        title: qsTr("Edit Waypoint")
        anchors.fill: parent
        onMenuVisibleChanged: {
            if (menuVisible)
                controller.setCurrentWaypointSelected(true);
            else if (editor.sourceComponent !== editComponent)
                controller.setCurrentWaypointSelected(false);
        }

        Controls.MenuItem {
            text: qsTr("Goto")
            enabled: false // TODO: wpt in mission
            onTriggered: console.log("Go to waypint") // TODO:
        }

        Controls.MenuItem {
            text: qsTr("Parameters")
            onTriggered: editor.open(menu.pointed.x, menu.pointed.y, editComponent)
        }

        Controls.MenuItem {
            text: qsTr("Remove")
            onTriggered: controller.removeWaypoint()
        }
    }

    PointedPopup {
        id: editor
        anchors.fill: parent
        minX: sidebar.width + Controls.Theme.margins * 2
        minY: menuBar.height + Controls.Theme.margins * 2
        maxX: width - dashboard.width - Controls.Theme.margins * 2
        maxY: height - map.controlHeight
        closePolicy: Controls.Popup.CloseOnEscape
    }

    Component {
        id: editComponent

        WaypointEdit {
            waypoint: controller.waypoint
            waypointIndex: controller.waypointIndex
            Component.onCompleted: controller.setCurrentWaypointSelected(true);
            Component.onDestruction: controller.setCurrentWaypointSelected(false);
        }
    }
}