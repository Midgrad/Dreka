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

    Connections {
        target: waypointEdit
        onCenterWaypoint: controller.centerWaypoint(routeId, index)
    }

    RoutesController {
        id: controller
        onSelectedRouteChanged: {
            if (controller.selectedRoute === undefined &&
                    sidebar.sourceComponent == routeEditComponent)
                sidebar.sourceComponent = routeListComponent;
            else if (controller.selectedRoute !== undefined &&
                     sidebar.sourceComponent == routeListComponent)
                 sidebar.sourceComponent = routeEditComponent;
        }
    }

    Component.onCompleted: {
        map.registerController("routesController", controller);
        mapMenu.addSubmenu(addWaypoint);
    }

    spacing: 1

    Controls.Button {
        visible: controller.selectedRoute === undefined
        tipText: highlighted ? qsTr("Close routes list") : qsTr("Open routes list")
        iconSource: "qrc:/icons/route.svg"
        highlighted: sidebar.sourceComponent == routeListComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : routeListComponent
    }

    Controls.Button {
        rightCropped: true
        visible: controller.selectedRoute !== undefined
        iconSource: "qrc:/icons/left.svg"
        tipText: qsTr("Back to routes")
        onClicked: {
            if (sidebar.sourceComponent == routeEditComponent)
                sidebar.sourceComponent = routeListComponent;
            controller.selectRoute(null);
        }
    }

    Controls.Button {
        leftCropped: true
        visible: controller.selectedRoute !== undefined
        text: controller.selectedRoute ? controller.routeData(controller.selectedRoute).name : ""
        tipText: highlighted ? qsTr("Close route viewer") : qsTr("Open route viewer")
        highlighted: sidebar.sourceComponent == routeEditComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : routeEditComponent
    }

    Component {
        id: routeListComponent

        RouteList {
            onExpand: controller.selectRoute(routeId);
        }
    }

    Component {
        id: routeEditComponent

        RouteEdit { route: controller.routeData(controller.selectedRoute) }
    }
}
