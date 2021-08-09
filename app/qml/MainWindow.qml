import QtQuick 2.12
import Industrial.Controls 1.0 as Controls
import QtQuick.Layouts 1.12

Controls.ApplicationWindow {
    id: main

    visible: true
    width: 1280
    height: 768

    Component.onCompleted: console.log(qmlEntries)

    Loader {
        anchors.fill: parent
        source: qmlEntries.substrate
    }

    RowLayout {
        id: menuBar
        anchors.top: parent.top
        anchors.left: parent.left
        spacing: Controls.Theme.baseSize

        Loader {
            source: qmlEntries.menu
        }
    }
}
