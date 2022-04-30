import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Missions 1.0

Controls.Pane {
    id: root

    property var selectedMissionId

    signal selectMission(var mission)

    width: Controls.Theme.baseSize * 13

    MissionListController { id: controller }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.FilterField {
                id: filterField
                flat: true
                placeholderText: qsTr("Filter missions")
                Layout.fillWidth: true
            }

            Controls.MenuButton {
                flat: true
                iconSource: "qrc:/icons/plus.svg"
                model: controller.missionTypes
                delegate: Controls.MenuItem {
                    text: modelData.name
                    onTriggered: controller.addMission(modelData.id)
                }
            }
        }

        Widgets.ListWrapper {
            emptyText: qsTr("No missions")
            model: controller.missions
            delegate: Mission {
                width: parent.width
                height: visible ? implicitHeight : 0
                visible: mission && mission.name.indexOf(filterField.text) > -1
                mission: modelData
                selected: mission.id === selectedMissionId
                onExpand: selectMission(mission)
                onRemove: controller.remove(mission.id)
                onMissionChanged: if (mission.id === selectedMissionId) selectMission(mission)
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
