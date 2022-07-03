import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Vehicles 1.0

import "List"
import "Dashboard"

ColumnLayout {
    id: root

    property bool maximized: true
    property bool editName: false
    property var selectedVehicle: null

    width: Controls.Theme.baseSize * 9
    spacing: 1

    VehiclesMapController {
        id: vehiclesMapController
        selectedVehicleId: selectedVehicle ? selectedVehicle.id : null
    }

    Component.onCompleted: map.registerController("vehiclesMapController", vehiclesMapController)

    Controls.Pane {
        id: pane
        padding: Controls.Theme.margins
        bottomCropped: true
        Layout.preferredWidth: root.width

        RowLayout {
            anchors.fill: parent
            spacing: 0

            Controls.Button {
                flat: true
                rightCropped: true
                tipText: qsTr("Vehicles")
                iconSource:"qrc:/icons/fleet.svg"
                highlighted: vehiclesList.visible
                onClicked: vehiclesList.visible ? vehiclesList.close() : vehiclesList.open()

                VehicleListView {
                    id: vehiclesList
                    x: -width - Controls.Theme.margins - Controls.Theme.spacing
                    y: -Controls.Theme.margins
                    selectedVehicleId: selectedVehicle ? selectedVehicle.id : null
                    onSelectVehicle: selectedVehicle = vehicle
                }
            }

            Controls.Button {
                flat: true
                rightCropped: true
                text: selectedVehicle ? selectedVehicle.name : "No vehicle"
                enabled: selectedVehicle
                tipText: qsTr("Edit name")
                visible: !editName
                onClicked: {
                    nameEdit.text = text;
                    editName = true;
                }
                Layout.fillWidth: true
            }

            Controls.TextField {
                id: nameEdit
                flat: true
                visible: editName
                onEditingFinished: {
                    vehiclesList.rename(selectedVehicle.id, text);
                    editName = false;
                }
                Keys.onEscapePressed: editName = false;
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
    }

    VehicleDashboardView {
        id: dashboard
        visible: maximized
        topCropped: true
        Layout.preferredWidth: root.width
        selectedVehicle: root.selectedVehicle
    }
}
