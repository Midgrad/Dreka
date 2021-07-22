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

    Text {
        font.bold: true
        font.pixelSize: Controls.Theme.auxFontSize
        color: Controls.Theme.colors.text
        text: qsTr("Lat:") + " " + (viewportController.cursorPosition.valid ?
                                        viewportController.cursorPosition.latitude.toFixed(8) : "-")
    }

    Text {
        font.bold: true
        font.pixelSize: Controls.Theme.auxFontSize
        color: Controls.Theme.colors.text
        text: qsTr("Lon:") + " " + (viewportController.cursorPosition.valid ?
                                        viewportController.cursorPosition.longitude.toFixed(8) : "-")
    }

    ScaleRuler {
        metersInPixel: viewportController.metersInPixel
    }
}
