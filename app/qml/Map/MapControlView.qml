import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    MapViewportController { id: viewport }

    Component.onCompleted: map.registerController("viewportController", viewport)
    Component.onDestruction: viewport.save()

    spacing: 10

    MapCompas {
        id: compas
        heading: viewport.heading
        pitch: viewport.pitch
        onClicked: viewport.lookTo(0, -90, 1);
    }

    MapCoordinates {
        id: coordinates
        latitude: viewport.cursorPosition.latitude
        longitude: viewport.cursorPosition.longitude
    }

    MapScale {
        metersInPixel: viewport.metersInPixel
    }

    MapRulerView {}
    MapGridView {}
    MapLayersView {}
}
