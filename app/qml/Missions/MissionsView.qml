import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Missions 1.0

RowLayout {
    id: root

    property var selectedMission: null

    Component.onCompleted: map.registerController("missionsMapController", missionsMapController)

    spacing: 1

    MissionsMapController {
        id: missionsMapController
        selectedMissionId: selectedMission ? selectedMission.id : null
    }

//    Controls.Menu {
//        id: addRouteItem
//        title: qsTr("Add route item")
//        enabled: selectedMission

//        Repeater {
//            model: controller.routeItemTypes(controller.selectedMission)

//            Controls.MenuItem {
//                text: modelData.name
//                onTriggered: controller.addRouteItem(controller.selectedMission, modelData.id,
//                                                     mapMenu.position);
//            }
//        }
//    }

//    Controls.Menu {
//        id: addPattern
//        title: qsTr("Add pattern")
//        enabled: selectedMission

//        Repeater {
//            model: controller.patternTypes(controller.selectedMission)

//            Controls.MenuItem {
//                text: modelData.name
//                iconSource: modelData.icon
//                onTriggered: missionPattern.newPattern(modelData.id, mapMenu.menuX, mapMenu.menuY,
//                                                     mapMenu.position);
//            }
//        }
//    }

    Controls.Button {
        visible: !selectedMission
        tipText: highlighted ? qsTr("Close routes list") : qsTr("Open routes list")
        iconSource: "qrc:/icons/routes.svg"
        highlighted: sidebar.sourceComponent == routeListComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : routeListComponent
    }

    Controls.Button {
        rightCropped: true
        visible: selectedMission
        iconSource: "qrc:/icons/left.svg"
        tipText: qsTr("Back to routes")
        onClicked: openRoutes()
    }

    Controls.Button {
        leftCropped: true
        visible: selectedMission
        text: selectedMission ? selectedMission.name : ""
        tipText: highlighted ? qsTr("Close route viewer") : qsTr("Open route viewer")
        highlighted: sidebar.sourceComponent == routeEditComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : routeEditComponent
    }

    Component {
        id: routeListComponent

        Controls.Pane {}
        //MissionList { onExpand: controller.selectMission(routeId); }
    }

    Component {
        id: routeEditComponent

        Controls.Pane {}
        //MissionItemList { routeId: controller.selectedMission }
    }
}
