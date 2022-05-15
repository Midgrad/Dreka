import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Vehicles 1.0

Controls.Popup {
    id: root

    property var selectedVehicleId

    function rename(vehicleId, name) { vehiclesController.rename(vehicleId, name); }

    signal selectVehicle(var vehicle)

    width: Controls.Theme.baseSize * 11
    closePolicy: Controls.Popup.CloseOnPressOutsideParent

    VehicleListController { id: vehiclesController }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.FilterField {
                id: filterField
                flat: true
                placeholderText: qsTr("Filter vehicles")
                Layout.fillWidth: true
            }

            Controls.MenuButton {
                flat: true
                iconSource: "qrc:/icons/plus.svg"
                model: vehiclesController.vehicleTypes
                delegate: Controls.MenuItem {
                    text: modelData.name
                    iconSource: "qrc:/icons/" + modelData.icon
                    onTriggered: {
                        root.selectVehicle(null);
                        vehiclesController.addVehicle(modelData.id);
                    }
                }
            }
        }

        Widgets.ListWrapper {
            emptyText: qsTr("No vehicles")
            model: vehiclesController.vehicles
            delegate: Vehicle {
                width: parent.width
                height: visible ? implicitHeight : 0
                visible: vehicle && vehicle.name.indexOf(filterField.text) > -1
                vehicle: modelData
                selected: vehicle.id === selectedVehicleId
                onExpand: selectVehicle(modelData)
                onVehicleChanged: if (vehicle.id === selectedVehicleId) selectVehicle(vehicle)
                onRemove: {
                    if (selected)
                        selectVehicle(null);
                    vehiclesController.remove(vehicle.id);
                }
                Component.onCompleted: if (!selectedVehicleId) selectVehicle(vehicle)
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
