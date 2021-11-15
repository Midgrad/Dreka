import QtQuick 2.6
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Item {
    id: root

    property real latitude: 0.0
    property real longitude: 0.0
    property real altitude: 0.0

    function addSubmenu(submenu) { menu.addMenu(submenu); }
    function removeSubmenu(submenu) { menu.removeMenu(submenu); }

    MapMenuController {
        id: controller
        onInvoked: {
            root.latitude = latitude;
            root.longitude = longitude;
            root.altitude = altitude;
            menu.open(x, y);
        }
    }

    Component.onCompleted: map.registerController("menuController", controller)

    PointedMenu { id: menu }
}
