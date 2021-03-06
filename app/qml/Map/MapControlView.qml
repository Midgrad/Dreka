import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    property bool crossMode: false
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

        MapButton {
            id: cross
            rightCropped: true
            leftCropped: true
            iconSource: crossMode ? ":/icons/cross.svg" : ":/icons/cursor.svg"
            tipText: crossMode ? qsTr("Map center coordinates") : qsTr("Cursor coordinates")
            onClicked: crossMode = !crossMode
        }

        MapCoordinates {
            id: coordinates
            latitude: crossMode ? viewport.centerPosition.latitude : viewport.cursorPosition.latitude
            longitude: crossMode ? viewport.centerPosition.longitude : viewport.cursorPosition.longitude
        }
    }

    MapScale {
        pixelScale: viewport.pixelScale
    }

    MapRulerView {}
    MapGridView {}
    MapLayersView {}
}
