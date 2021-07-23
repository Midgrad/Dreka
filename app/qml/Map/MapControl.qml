import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: row

    spacing: 10

    Compas {
        id: compas
        heading: viewport.heading
        pitch: viewport.pitch
        onClicked: viewport.lookTo(0, -90, 1);
    }

    Coordinates {
        id: coordinates
        latitude: viewport.cursorPosition.latitude
        longitude: viewport.cursorPosition.longitude
    }

    MapScale {
        metersInPixel: viewport.metersInPixel
    }

    MapRuler {}
}
