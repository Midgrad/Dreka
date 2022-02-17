import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    readonly property alias centerPosition: viewport.centerPosition

    MapViewportController { id: viewport }

    Component.onCompleted: map.registerController("viewportController", viewport)
    Component.onDestruction: viewport.save()

    spacing: Controls.Theme.spacing

    RowLayout {
        spacing: 1

        MapCompas {
            id: compas
            heading: viewport.heading
            pitch: viewport.pitch
            rightCropped: true
            onClicked: viewport.lookTo(0, -90, 1);
        }

        MapCoordinates {
            id: coordinates
            latitude: viewport.cursorPosition.latitude ? viewport.cursorPosition.latitude : NaN
            longitude: viewport.cursorPosition.longitude ? viewport.cursorPosition.longitude : NaN
        }
    }

    MapScale {
        pixelScale: viewport.pixelScale
    }

    MapRulerView {}
    MapGridView {}
    MapLayersView {}
}
