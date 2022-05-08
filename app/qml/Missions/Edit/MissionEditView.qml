import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Missions 1.0

Controls.Pane {
    id: root

    property alias selectedMissionId : editController.missionId

    property alias _vehicle : editController.vehicle

    width: Controls.Theme.baseSize * 13

    MissionEditController { id: editController }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: 0

            Controls.Label { text: qsTr("Vehicle") }

            Controls.ComboBox {
                id: vehicleBox
                model: editController.vehicles
                displayText: _vehicle ? _vehicle.name : qsTr("No vehicle")
                flat: true
                onActivated: editController.assignVehicle(model[index].id)
                Layout.fillWidth: true
            }

            Controls.MenuButton {
                iconSource: "qrc:/icons/dots.svg"
                tipText: qsTr("Mission actions")
                flat: true
                leftCropped: true
                enabled: _vehicle && _vehicle.online
                model: ListModel {
                    ListElement { text: qsTr("Upload"); property var action: () => { editController.upload() } }
                    ListElement { text: qsTr("Download"); property var action: () => { editController.download() } }
                    ListElement { text: qsTr("Clear"); property var action: () => { editController.clear() } }
                }
                onTriggered: modelData.action()
            }
        }

        Controls.TabBar {
            flat: true
            Controls.TabButton { text: qsTr("Route"); flat: true }
            Controls.TabButton { text: qsTr("Fence"); flat: true; enabled: false }
            Controls.TabButton { text: qsTr("Rally"); flat: true; enabled: false }
            Layout.fillWidth: true
        }

        Controls.ProgressBar {
            id: progress
            visible: editController.operationProgress != -1
            flat: true
            radius: Controls.Theme.rounding
            from: 0
            to: 100
            value: editController.operationProgress
            implicitHeight: Controls.Theme.baseSize / 3
            Layout.fillWidth: true

            Controls.Button {
                anchors.fill: parent
                flat: true
                tipText: qsTr("Cancel")
                onClicked: editController.cancel()
            }
        }
    }
}
