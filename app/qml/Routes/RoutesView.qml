import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    function setActiveMission(missionId) { controller.setActiveMission(missionId); }

    Controls.Menu {
        id: addWaypoint
        title: qsTr("Add Waypoint")
        enabled: controller.selectedRoute !== undefined

        Repeater {
            model: controller.waypointTypes(controller.selectedRoute)

            Controls.MenuItem {
                text: modelData.name
                onTriggered: {
                    var args = {};
                    args["latitude"] = mapMenu.latitude;
                    args["longitude"] = mapMenu.longitude;
                    args["altitude"] = mapMenu.altitude;

                    controller.addWaypoint(controller.selectedRoute, modelData.id, args);
                }
            }
        }
    }

    RoutesController { id: controller }

    Component.onCompleted: {
        map.registerController("routesController", controller);
        mapMenu.addPositionSubmenu(addWaypoint);
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
