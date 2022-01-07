import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka 1.0

Controls.Popup {
    id: root

    width: Controls.Theme.baseSize * 11
    closePolicy: Controls.Popup.CloseOnPressOutsideParent

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
                //model: controller.routeTypes
                delegate: Controls.MenuItem {
                    text: modelData.name
                    onTriggered: controller.addNewVehicle(modelData.id)
                }
            }
        }

        Widgets.ListWrapper {
            emptyText: qsTr("No vehicles")
            model: controller.vehicles
            delegate: Vehicle {
                width: parent.width
                height: visible ? implicitHeight : 0
                visible: vehicle && vehicle.name.indexOf(filterField.text) > -1
                vehicle: modelData
                //onExpand: root.expand(vehicle.id)
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
