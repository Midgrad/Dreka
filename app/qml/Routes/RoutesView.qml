import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    readonly property alias selectedRoute: controller.selectedRoute
    readonly property alias selectedRouteItemIndex: controller.selectedRouteItemIndex

    function openRoutes() {
        sidebar.sourceComponent = routeListComponent;
        controller.selectRoute(null);
    }

    function selectRoute(routeId, open = true) {
        controller.selectRoute(routeId);
        if (open)
            sidebar.sourceComponent = routeEditComponent;
    }

    function selectRouteItem(routeId, index, open = true) {
        selectRoute(routeId, open);
        controller.selectRouteItemIndex(index);
    }

    Component.onCompleted: {
        map.registerController("routesController", controller);
        mapMenu.addSubmenu(addRouteItem);
        mapMenu.addSubmenu(addPattern);
    }

    spacing: 1

    RoutesController {
        id: controller
        onSelectedRouteChanged: {
            if (controller.selectedRoute === undefined &&
                    sidebar.sourceComponent == routeEditComponent)
                sidebar.sourceComponent = routeListComponent;
            else if (controller.selectedRoute !== undefined &&
                     sidebar.sourceComponent == routeListComponent)
                 sidebar.sourceComponent = routeEditComponent;

            routePattern.selectRoute(controller.selectedRoute)
        }
    }

    Controls.Menu {
        id: addRouteItem
        title: qsTr("Add route item")
        enabled: controller.selectedRoute !== undefined

        Repeater {
            model: controller.routeItemTypes(controller.selectedRoute)

            Controls.MenuItem {
                text: modelData.name
                onTriggered: controller.addRouteItem(controller.selectedRoute, modelData.id,
                                                     mapMenu.position);
            }
        }
    }

    Controls.Menu {
        id: addPattern
        title: qsTr("Add pattern")
        enabled: controller.selectedRoute !== undefined

        Repeater {
            model: controller.routePatternTypes(controller.selectedRoute)

            Controls.MenuItem {
                text: modelData.name
                iconSource: modelData.icon
                onTriggered: routePattern.newPattern(modelData.id, mapMenu.menuX, mapMenu.menuY,
                                                     mapMenu.position);
            }
        }
    }

    Controls.Button {
        visible: controller.selectedRoute === undefined
        tipText: highlighted ? qsTr("Close routes list") : qsTr("Open routes list")
        iconSource: "qrc:/icons/routes.svg"
        highlighted: sidebar.sourceComponent == routeListComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : routeListComponent
    }

    Controls.Button {
        rightCropped: true
        visible: controller.selectedRoute !== undefined
        iconSource: "qrc:/icons/left.svg"
        tipText: qsTr("Back to routes")
        onClicked: openRoutes()
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

        RouteList { onExpand: controller.selectRoute(routeId); }
    }

    Component {
        id: routeEditComponent

        RouteItemList { routeId: controller.selectedRoute }
    }
}
