import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Item {
    id: root

    property real latitude: 0.0
    property real longitude: 0.0
    property real altitude: 0.0

    function addPositionSubmenu(submenu) { positionMenu.addMenu(submenu); }
    function removePositionSubmenu(submenu) { positionMenu.removeMenu(submenu); }
    function addEntitySubmenu(submenu) { entityMenu.addMenu(submenu); }
    function removeEntitySubmenu(submenu) { entityMenu.removeMenu(submenu); }

    MapMenuController {
        id: controller
        onInvokedPosition: {
            root.latitude = latitude;
            root.longitude = longitude;
            root.altitude = altitude;

            if (positionMenu.count)
                positionMenu.popup(x, y);
        }
    }

    Component.onCompleted: map.registerController("menuController", controller)

    Controls.Menu { id: positionMenu }
    Controls.Menu { id: entityMenu }
}
