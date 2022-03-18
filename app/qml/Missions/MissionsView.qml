import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    readonly property alias selectedMission: controller.selectedMission
    readonly property alias selectedItemIndex: controller.selectedItemIndex

    function openRoutes() {
        sidebar.sourceComponent = routeListComponent;
        controller.selectMission(null);
    }

    function selectMission(routeId, open = true) {
        controller.selectMission(routeId);
        if (open)
            sidebar.sourceComponent = routeEditComponent;
    }

    function selectMissionItem(routeId, index, open = true) {
        selectMission(routeId, open);
        controller.selectItemIndex(index);
    }

    Component.onCompleted: {
        map.registerController("missionsController", controller);
        mapMenu.addSubmenu(addRouteItem);
        mapMenu.addSubmenu(addPattern);
    }

    spacing: 1

    MissionsController {
        id: controller
        onSelectedMissionChanged: {
            if (controller.selectedMission === undefined &&
                    sidebar.sourceComponent == routeEditComponent)
                sidebar.sourceComponent = routeListComponent;
            else if (controller.selectedMission !== undefined &&
                     sidebar.sourceComponent == routeListComponent)
                 sidebar.sourceComponent = routeEditComponent;

            missionPattern.selectMission(controller.selectedMission)
        }
    }

    Controls.Menu {
        id: addRouteItem
        title: qsTr("Add route item")
        enabled: controller.selectedMission !== undefined

        Repeater {
            model: controller.routeItemTypes(controller.selectedMission)

            Controls.MenuItem {
                text: modelData.name
                onTriggered: controller.addRouteItem(controller.selectedMission, modelData.id,
                                                     mapMenu.position);
            }
        }
    }

    Controls.Menu {
        id: addPattern
        title: qsTr("Add pattern")
        enabled: controller.selectedMission !== undefined

        Repeater {
            model: controller.patternTypes(controller.selectedMission)

            Controls.MenuItem {
                text: modelData.name
                iconSource: modelData.icon
                onTriggered: missionPattern.newPattern(modelData.id, mapMenu.menuX, mapMenu.menuY,
                                                     mapMenu.position);
            }
        }
    }

    Controls.Button {
        visible: controller.selectedMission === undefined
        tipText: highlighted ? qsTr("Close routes list") : qsTr("Open routes list")
        iconSource: "qrc:/icons/routes.svg"
        highlighted: sidebar.sourceComponent == routeListComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : routeListComponent
    }

    Controls.Button {
        rightCropped: true
        visible: controller.selectedMission !== undefined
        iconSource: "qrc:/icons/left.svg"
        tipText: qsTr("Back to routes")
        onClicked: openRoutes()
    }

    Controls.Button {
        leftCropped: true
        visible: controller.selectedMission !== undefined
        text: controller.selectedMission ? controller.routeData(controller.selectedMission).name : ""
        tipText: highlighted ? qsTr("Close route viewer") : qsTr("Open route viewer")
        highlighted: sidebar.sourceComponent == routeEditComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : routeEditComponent
    }

    Component {
        id: routeListComponent

        MissionList { onExpand: controller.selectMission(routeId); }
    }

    Component {
        id: routeEditComponent

        MissionItemList { routeId: controller.selectedMission }
    }
}
