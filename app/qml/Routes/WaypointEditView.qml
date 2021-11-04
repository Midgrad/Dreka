import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Item {
    id: root

    WaypointEditController { id: controller }

    Component.onCompleted: map.registerController("waypointEditController", controller)

}
