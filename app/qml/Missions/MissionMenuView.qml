import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Item {
    id: root

    signal centerRouteItem(var routeId, int index)

    MissionMenuController {
        id: controller
        onMenuInvoked: menu.open(x, y)
        onDropped: menu.close()
    }

    Component.onCompleted: map.registerController("missionMenuController", controller)

    PointedMenu {
        id: menu
        title: qsTr("Route item")
        anchors.fill: parent

        Controls.MenuItem {
            text: qsTr("Goto")
            enabled: controller.canGoto
            onTriggered: controller.gotoItem();
        }

        Controls.MenuItem {
            text: qsTr("Edit")
            enabled: missions.selectedMission != controller.route
                     || missions.selectedItemIndex != controller.inRouteIndex
            onTriggered: missions.selectMissionItem(controller.route, controller.inRouteIndex)
        }

        Controls.MenuItem {
            text: qsTr("Remove")
            enabled: missions.selectedMission == controller.route
            onTriggered: controller.remove()
        }
    }
}
