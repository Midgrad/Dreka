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
        onCloseEditor: if (editor.sourceComponent) editor.close();
        onMenuInvoked: menu.open(x, y)
        onUpdatePosition: {
            if (menu.menuVisible)
                menu.move(x, y);
            else if (editor.item)
                editor.move(x, y);
        }
    }

    Connections {
        target: mapMenu
        onMenuVisibleChanged: if (mapMenu.menuVisible) if (editor.sourceComponent) editor.close();
    }

    Component.onCompleted: map.registerController("routeItemController", controller)

    PointedMenu {
        id: menu
        title: qsTr("Route item")
        anchors.fill: parent
        onMenuVisibleChanged: {
            if (menuVisible) {
                if (editor.sourceComponent)
                    editor.close();
            }
            else if (editor.sourceComponent != editComponent) {
                controller.setIndex(-1);
            }
        }

        Controls.MenuItem {
            text: qsTr("Goto")
            enabled: controller.canGoto
            onTriggered: controller.gotoItem();
        }

        Controls.MenuItem {
            text: qsTr("Parameters")
            onTriggered: editor.open(menu.lastX, menu.lastY, editComponent)
        }

        Controls.MenuItem {
            text: qsTr("Remove")
            onTriggered: controller.remove()
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
        onOpenedChanged: if (!opened && !menu.menuVisible) controller.setIndex(-1)
        pointerVisible: item && item.pinned
    }

    Component {
        id: editComponent

        RouteItemEdit {
            routeItem: controller.routeItem
            inRouteIndex: controller.inRouteIndex
        }
    }
}
