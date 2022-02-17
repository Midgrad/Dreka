import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    spacing: 1

    MissionsController { id: controller }

    Controls.Button {
        tipText: highlighted ? qsTr("Close missions list") : qsTr("Open missions list")
        iconSource: "qrc:/icons/mission.svg"
        highlighted: sidebar.sourceComponent == missionListComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : missionListComponent
    }

    Component {
        id: missionListComponent

        MissionsList {}
    }
}
