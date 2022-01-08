import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka 1.0

Controls.Pane {
    id: root

    property bool maximized: true
    property bool editName: false
    property var selectedVehicle: controller.vehicle(controller.selectedVehicle)

    padding: Controls.Theme.margins

    VehiclesController {
        id: controller
        onVehicleChanged: if (vehicleId === controller.selectedVehicle) root.selectedVehicle = vehicle
        onSelectedVehicleChanged: root.selectedVehicle = controller.vehicle(controller.selectedVehicle)
    }

    Component.onCompleted: map.registerController("vehiclesController", controller)

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: 0

            Controls.Button {
                flat: true
                rightCropped: true
                tipText: qsTr("Vehicles")
                iconSource:"qrc:/icons/fleet.svg"
                highlighted: vehiclesList.visible
                onClicked: vehiclesList.visible ? vehiclesList.close() : vehiclesList.open()

                VehiclesListView {
                    id: vehiclesList
                    x: -width - Controls.Theme.margins - Controls.Theme.spacing
                }
            }

            Controls.Button {
                flat: true
                rightCropped: true
                text: selectedVehicle.name
                tipText: qsTr("Edit name")
                visible: !editName
                onClicked: editName = true
                Layout.fillWidth: true
            }

            Controls.TextField {
                id: nameEdit
                flat: true
                visible: editName
                Binding on text {
                    value: selectedVehicle.name
                    when: !nameEdit.activeFocus
                }
                onEditingFinished: {
                    controller.rename(selectedVehicle.id, text);
                    editName = false;
                }
                Layout.fillWidth: true
            }

            Controls.Button {
                flat: true
                leftCropped: true
                tipText: maximized ? qsTr("Minimize") : qsTr("Maximize")
                iconSource: maximized ? "qrc:/icons/up.svg" : "qrc:/icons/down.svg"
                onClicked: maximized = !maximized
            }
        }

        Repeater {
            model: controller.dashboardModel(controller.selectedVehicle)

            Loader {
                id: dashboard
                source: modelData
                Layout.fillWidth: true
            }
        }
    }
}

