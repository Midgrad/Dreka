import QtQuick 2.6
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Item {
    id: root

    property var position: ({})
    property int menuX: 0
    property int menuY: 0

    property alias menuVisible: menu.menuVisible

    function addSubmenu(submenu) { menu.addMenu(submenu); }
    function removeSubmenu(submenu) { menu.removeMenu(submenu); }
    function addItem(item) { menu.addItem(item); }
    function removeItem(item) { menu.removeItem(item); }

    MapMenuController {
        id: controller
        onInvoked: {
            position["latitude"] = latitude;
            position["longitude"] = longitude;
            position["altitude"] = altitude;

            root.menuX = x;
            root.menuY = y;
            menu.open(x, y);
        }
        onDropped: menu.close()
    }

    Component.onCompleted: map.registerController("menuController", controller)

    PointedMenu {
        id: menu
        anchors.fill: parent
    }
}
