import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka 1.0

Controls.Pane {
    id: root

    property bool maximized: true

    padding: Controls.Theme.margins

    VehiclesController { id: controller }

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
                iconSource:"qrc:/icons/configure.svg"
                Layout.fillHeight: true
                highlighted: vehiclesList.visible
                onClicked: vehiclesList.visible ? vehiclesList.close() : vehiclesList.open()

                VehiclesListView {
                    id: vehiclesList
                    x: -width - Controls.Theme.margins - Controls.Theme.spacing
                }
            }

            Controls.ComboBox {
                id: vehiclesBox
                flat: true
                model: controller.vehicles
                labelText: qsTr("Vehicle")
                textRole: "name"
                onActivated: controller.selectVehicle(model[index].id)
                Layout.fillWidth: true
            }

            Controls.Button {
                flat: true
                leftCropped: true
                tipText: maximized ? qsTr("Minimize") : qsTr("Maximize")
                iconSource: maximized ? "qrc:/icons/up.svg" : "qrc:/icons/down.svg"
                onClicked: maximized = !maximized
                Layout.fillHeight: true
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

