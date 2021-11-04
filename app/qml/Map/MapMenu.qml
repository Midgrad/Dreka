import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Item {
    id: root

    MapMenuController {
        id: controller
        onInvoked: console.log(x, y, latitude, longitude, altitude);
    }

    Component.onCompleted: map.registerController("menuController", controller)
}
