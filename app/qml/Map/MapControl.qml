import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12

RowLayout {
    id: row

    spacing: 10

    Compas {
        id: compas
        heading: viewportController.heading
        pitch: viewportController.pitch
        onClicked: viewportController.lookTo(0, -90, 1);
    }

    Label {
        id: tools
        visible: viewportController.cursorPosition.valid
        text: "Lat:" + viewportController.cursorPosition.latitude.toFixed(8) + " " +
              "Lon:" + viewportController.cursorPosition.longitude.toFixed(8)
    }
}
