import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    function openMissions() {
        controller.selectMission(null);
        sidebar.sourceComponent = missionListComponent;
    }

    function selectMission(missionId) {
        controller.selectMission(missionId);
        sidebar.sourceComponent = missionEditComponent;
    }

    spacing: 1

    MissionsController { id: controller }

    Controls.Button {
        tipText: highlighted ? qsTr("Close missions list") : qsTr("Open missions list")
        iconSource: "qrc:/icons/mission.svg"
        highlighted: sidebar.sourceComponent == missionListComponent
                     || sidebar.sourceComponent == missionEditComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : missionListComponent
    }

    Component {
        id: missionListComponent

        MissionList { onExpand: selectMission(missionId) }
    }

    Component {
        id: missionEditComponent

        MissionEditView {
            mission: controller.selectedMission
            onBack: openMissions()
        }
    }
}
