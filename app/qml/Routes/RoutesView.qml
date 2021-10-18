import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Item {
    id: root

    function selectRoute(routeId) { controller.selectRoute(routeId); }

    RoutesController { id: controller }

    Component.onCompleted: map.registerController("routesController", controller)
}
