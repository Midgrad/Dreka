import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka 1.0

Controls.Popup {
    id: root

    property alias missionId: operationController.missionId

    readonly property var mission: operationController.mission
    readonly property var operation: operationController.operation

    MissionOperationController { id: operationController }

    ColumnLayout {
        id: column
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        Widgets.PropertyTable {
            flat: true
            labelWidth: Controls.Theme.baseSize * 3
            Layout.fillWidth: true

            Controls.TextField {
                id: nameEdit
                labelText: qsTr("Mission")
                Binding on text { value: mission.name ? mission.name : ""; when: !nameEdit.activeFocus }
                onEditingFinished: operationController.save({ name: text });
            }

//            Controls.ComboBox {
//                id: routeBox
//                labelText: qsTr("Route")
//                enabled: false
//                displayText: mission.route ? mission.route : ""
//            }
        }

        Controls.ProgressBar {
            id: progress
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
                onClicked: operationController.cancel()
            }
        }

        Controls.ButtonBar {
            id: bar
            flat: true
            visible: operation.id === undefined
            Layout.fillWidth: true

            Controls.Button {
                text: qsTr("Download")
                borderColor: Controls.Theme.colors.controlBorder
                enabled: mission.id ? true : false
                onClicked: operationController.download()
            }

            Controls.Button {
                text: qsTr("Upload")
                borderColor: Controls.Theme.colors.controlBorder
                enabled: mission.id ? true : false
                onClicked: operationController.upload()
            }

            Controls.Button {
                text: qsTr("Clear")
                borderColor: Controls.Theme.colors.controlBorder
                enabled: mission.id ? true : false
                highlightColor: Controls.Theme.colors.negative
                hoverColor: highlightColor
                onClicked: operationController.clear()
            }
        }

//        // TODO: ListButton
//        Controls.Button {
//            flat: true
//            text: qsTr("Route")
//            iconSource: routePropertiesVisible ? "qrc:/icons/down.svg" : "qrc:/icons/right.svg"
//            onClicked: routePropertiesVisible = !routePropertiesVisible
//            Layout.fillWidth: true
//        }

//        RouteView {
//            id: routeList
//            visible: routePropertiesVisible
//            route: missionController.route(mission.id)
//            Layout.fillWidth: true
//            Layout.fillHeight: true
//        }
    }
}
