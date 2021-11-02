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
                id: trackButton
                enabled: controller.selectedVehicle !== undefined
                flat: true
                rightCropped: true
                iconSource: controller.tracking ? "qrc:/icons/cancel_track.svg" : "qrc:/icons/center.svg"
                tipText: controller.tracking ? qsTr("Cancel track") : qsTr("Track")
                onClicked: controller.setTracking(!controller.tracking)
                Layout.fillHeight: true
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

        GenericDashboard {
            Layout.fillWidth: true
        }
    }
}

