import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    function selectRoute(routeId) { controller.selectRoute(routeId); }

    RoutesController { id: controller }

    Component.onCompleted: map.registerController("routesController", controller)

    spacing: 1

    Controls.Button {
        iconSource: "qrc:/icons/route.svg"
        tipText: qsTr("Routes")
        highlighted: routeList.visible
        onClicked: routeList.visible ? routeList.close() : routeList.open()
    }

    RouteList {
        id: routeList
        y: root.height + Controls.Theme.margins
        x: -root.parent.x
    }
}
