import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Vehicles 1.0

Controls.Pane {
    id: root

    property alias selectedVehicleId: controller.selectedVehicle

    padding: Controls.Theme.margins

    VehicleDashboardController {
        id: controller
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        Repeater {
            id: repeater
            model: controller.instruments(controller.selectedVehicle)

            Loader {
                source: modelData
                Layout.fillWidth: true
            }
        }

        Controls.Label {
            text: qsTr("No instruments")
            font.pixelSize: Controls.Theme.auxFontSize
            color: Controls.Theme.colors.description
            visible: !repeater.count
            Layout.alignment: Qt.AlignCenter
        }
    }
}
