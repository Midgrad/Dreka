import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    function setActiveMission(missionId) { controller.setActiveMission(missionId); }

    Controls.MenuItem {
        id: addWaypoint
        enabled: controller.selectedRoute !== undefined
        text: qsTr("Add Waypoint")
        iconSource: "qrc:/icons/plus.svg"
        onTriggered: controller.addWaypoint(controller.selectedRoute, mapMenu.latitude, mapMenu.longitude, mapMenu.altitude)
    }

    RoutesController { id: controller }

    Component.onCompleted: {
        map.registerController("routesController", controller);
        mapMenu.addItem(addWaypoint);
    }

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
