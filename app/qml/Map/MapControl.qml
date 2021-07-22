import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

RowLayout {
    id: row

    spacing: 10

    Compas {
        id: compas
        heading: viewportController.heading
        pitch: viewportController.pitch
        onClicked: viewportController.lookTo(0, -90, 1);
    }

    Coordinates {
        id: coordinates
        latitude: viewportController.cursorPosition.latitude
        longitude: viewportController.cursorPosition.longitude
    }

    ScaleRuler {
        metersInPixel: viewportController.metersInPixel
    }
}
