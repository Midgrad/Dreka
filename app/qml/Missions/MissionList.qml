import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets

Controls.Pane {
    id: root

    signal expand(var routeId)

    width: Controls.Theme.baseSize * 13

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.FilterField {
                id: filterField
                flat: true
                placeholderText: qsTr("Filter routes")
                Layout.fillWidth: true
            }

            Controls.MenuButton {
                flat: true
                iconSource: "qrc:/icons/plus.svg"
                model: controller.missionTypes
                delegate: Controls.MenuItem {
                    text: modelData.name
                    onTriggered: controller.addNewMission(modelData.id)
                }
            }
        }

        Widgets.ListWrapper {
            emptyText: qsTr("No routes")
            model: controller.missionIds
            delegate: MissionListItem {
                width: parent.width
                height: visible ? implicitHeight : 0
                visible: route && route.name.indexOf(filterField.text) > -1
                routeId: modelData
                onExpand: root.expand(routeId)
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
