import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "Map"
import "Vehicles"
import "Missions"

Controls.ApplicationWindow {
    id: main


    visible: true
    width: 1280
    height: 768

    // Common controllers
    ClipboardController { id: clipboardController }

    CesiumMap {
        id: map
        anchors.fill: parent
    }

    MapMenu {
        id: mapMenu
        anchors.fill: map
    }


    RowLayout {
        id: menuBar
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: Controls.Theme.margins
        spacing: Controls.Theme.spacing

        Repeater {
            model: layout.menu

            Loader { source: modelData }
        }

        MissionsView { id: missions }
    }

    VehiclesView {
        id: vehicles
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: Controls.Theme.margins
    }

    Loader {
        id: sidebar
        anchors.top: menuBar.bottom
        anchors.left: map.left
        anchors.margins: Controls.Theme.margins
        width: item ? item.width : 0
        height: Math.min(implicitHeight, main.height - map.controlHeight - menuBar.height -
                                         Controls.Theme.margins * 2)
    }
}
