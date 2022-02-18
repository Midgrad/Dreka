import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets

Controls.Pane {
    id: root

    signal expand(var missionId)

    width: Controls.Theme.baseSize * 13

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
        }

        Widgets.ListWrapper {
            emptyText: qsTr("No missions")
            model: controller.missions
            delegate: MissionListItem {
                width: parent.width
                height: visible ? implicitHeight : 0
                visible: mission.name.indexOf(filterField.text) > -1
                mission: modelData
                onExpand: root.expand(mission.id)
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
