import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Item {
    id: root

    signal centerRouteItem(var routeId, int index)

    RouteMenuController {
        id: controller
        onMenuInvoked: menu.open(x, y)
    }

    Component.onCompleted: map.registerController("routeMenuController", controller)

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
            enabled: routes.selectedRoute !== controller.route
                     || routes.selectedRouteItemIndex != controller.inRouteIndex
            onTriggered: routes.select(controller.route, controller.inRouteIndex)
        }

        Controls.MenuItem {
            text: qsTr("Remove")
            enabled: routes.selectedRoute === controller.route
            onTriggered: controller.remove()
        }
    }
}
