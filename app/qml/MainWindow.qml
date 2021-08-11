import QtQuick 2.12
import Industrial.Controls 1.0 as Controls
import QtQuick.Layouts 1.12

import "Map"

Controls.ApplicationWindow {
    id: main

    readonly property real availableHeight: main.height -
                                            Controls.Theme.baseSize * 3 -
                                            Controls.Theme.margins * 2

    visible: true
    width: 1280
    height: 768

    CesiumMap {
        id: map
        anchors.fill: parent
    }

    RowLayout {
        id: menuBar
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: Controls.Theme.margins
        spacing: Controls.Theme.baseSize

        Repeater {
            model: qmlEntries.menu

            Loader { source: modelData }
        }
    }
}
