import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka 1.0

Controls.Pane {
    id: root

    property var mission
    readonly property var operation: operationController.operation
    property bool editName: false

    signal back()

    width: Controls.Theme.baseSize * 13

    MissionOperationController {
        id: operationController
    }

    ColumnLayout {
        id: column
        anchors.fill: parent

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Button {
                flat: true
                rightCropped: true
                iconSource: "qrc:/icons/left.svg"
                tipText: qsTr("Back to missions")
                onClicked: back()
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                text: mission.id ? mission.name : ""
                tipText: qsTr("Edit name")
                visible: !editName
                onClicked: editName = true
                Layout.fillWidth: true
            }

            Controls.TextField {
                id: nameEdit
                flat: true
                visible: editName
                Binding on text { value: mission ? mission.name : ""; when: !nameEdit.activeFocus }
                onEditingFinished: {
                    controller.renameMission(mission.id, text);
                    editName = false;
                }
                Layout.fillWidth: true
            }

            Controls.Label {
                text: mission.id ? mission.type : ""
                type: Controls.Theme.Label
            }
        }

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Label {
                text: qsTr("Route")
                Layout.fillWidth: true
            }

            Controls.ComboBox {
                id: routeBox
                flat: true
                model: controller.routes
                textRole: "name"
                onActivated: controller.assignRoute(model[index].id);
                displayText: {
                    if (!mission)
                        return "";

                    for (var i = 0; i < model.length; ++i) {
                        if (model[i].id === mission.route)
                            return model[i].name;
                    }

                    return ""
                }
                Layout.fillWidth: true
            }
        }

        Controls.ProgressBar {
            id: progress
            enabled: bar.enabled
            visible: operation.id !== undefined
            flat: true
            radius: Controls.Theme.rounding
            from: 0
            to: operation.total ? operation.total : 0
            value: operation.progress ? operation.progress : 0
            Layout.fillWidth: true

            Controls.Button {
                anchors.fill: parent
                flat: true
                tipText: qsTr("Cancel")
                text: progress.value + "/" + progress.to
                onClicked: operationController.cancel(mission.id)
            }
        }

        Controls.ButtonBar {
            id: bar
            flat: true
            visible: operation.id === undefined
            enabled: mission.id && mission.route /*&& selectedVehicle.online*/ ? true : false
            Layout.fillWidth: true

            Controls.Button {
                text: qsTr("Download")
                borderColor: Controls.Theme.colors.controlBorder
                onClicked: operationController.download(mission.id)
            }

            Controls.Button {
                text: qsTr("Upload")
                borderColor: Controls.Theme.colors.controlBorder
                onClicked: operationController.upload(mission.id)
            }

            Controls.Button {
                text: qsTr("Clear")
                borderColor: Controls.Theme.colors.controlBorder
                highlightColor: Controls.Theme.colors.negative
                hoverColor: highlightColor
                onClicked: operationController.clear(mission.id )
            }
        }
    }
}
