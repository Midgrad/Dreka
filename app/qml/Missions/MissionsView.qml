import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka.Missions 1.0

import "List"
import "Edit"

RowLayout {
    id: root

    property var selectedMission: null

    function selectMission(missionId) {

    }

    onSelectedMissionChanged: {
        if (selectedMission && sidebar.sourceComponent == missionListComponent) {
            sidebar.sourceComponent = missionEditComponent;
        }
        else if (!selectedMission && sidebar.sourceComponent == missionEditComponent) {
            sidebar.sourceComponent = missionListComponent;
        }
    }
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
        tipText: highlighted ? qsTr("Close missions list") : qsTr("Open missions list")
        iconSource: "qrc:/icons/routes.svg"
        highlighted: sidebar.sourceComponent == missionListComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : missionListComponent
    }

    Controls.Button {
        rightCropped: true
        visible: selectedMission
        iconSource: "qrc:/icons/left.svg"
        tipText: qsTr("Deselect mission")
        onClicked: selectedMission = null
    }

    Controls.Button {
        leftCropped: true
        visible: selectedMission
        text: selectedMission ? selectedMission.name : ""
        tipText: highlighted ? qsTr("Close mission viewer") : qsTr("Open mission viewer")
        highlighted: sidebar.sourceComponent == missionEditComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : missionEditComponent
    }

    Component {
        id: missionListComponent

        MissionListView { onSelectMission: selectedMission = mission }
    }

    Component {
        id: missionEditComponent

        MissionEditView { selectedMissionId: selectedMission.id }
    }
}
