import QtQuick 2.12
import QtQuick.Controls 2.12
import Dreka 1.0

import "Map"

ApplicationWindow {
    id: main

    visible: true
    width: 1280
    height: 768

    ClipboardController {
        id: clipboard
    }

    Map {
        id: map
        anchors.fill: parent
    }
}
