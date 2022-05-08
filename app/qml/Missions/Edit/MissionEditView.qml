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
                model: ListModel {
                    ListElement { text: qsTr("Upload"); property var action: () =>  { editController.upload() } }
                    ListElement { text: qsTr("Download"); property var action: () =>  { editController.download() } }
                    ListElement { text: qsTr("Clear"); property var action: () =>  { editController.clear() } }
                }
                onTriggered: modelData.action()
            }
        }

//        Controls.ProgressBar {
//            id: progress
//            enabled: bar.enabled
//            visible: !!operation
//            flat: true
//            radius: Controls.Theme.rounding
//            from: 0
//            to: operation && operation.total ? operation.total : 0
//            value: operation && operation.progress ? operation.progress : 0
//            Layout.fillWidth: true

//            Controls.Button {
//                anchors.fill: parent
//                flat: true
//                tipText: qsTr("Cancel")
//                text: progress.value + "/" + progress.to
//                onClicked: editController.cancel()
//            }
//        }

//        Controls.ButtonBar {
//            id: bar
//            flat: true
//            visible: !operation
//            enabled: editController.online
//            Layout.fillWidth: true

//            Controls.Button {
//                text: qsTr("Download")
//                borderColor: Controls.Theme.colors.controlBorder
//                onClicked: editController.download()
//            }

//            Controls.Button {
//                text: qsTr("Upload")
//                borderColor: Controls.Theme.colors.controlBorder
//                onClicked: editController.upload()
//            }

//            Controls.Button {
//                text: qsTr("Clear")
//                borderColor: Controls.Theme.colors.controlBorder
//                highlightColor: Controls.Theme.colors.negative
//                hoverColor: highlightColor
//                onClicked: editController.clear()
//            }
//        }
    }
}
