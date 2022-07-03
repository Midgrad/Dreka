import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.Vehicles 1.0

Controls.Pane {
    id: root

    property var selectedVehicle

    padding: Controls.Theme.margins

    VehicleDashboardController {
        id: dashboardController
        selectedVehicleId: selectedVehicle ? selectedVehicle.id : null
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        Repeater {
            id: repeater
            model: selectedVehicle ? dashboardController.instruments(selectedVehicle.type) : []

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
