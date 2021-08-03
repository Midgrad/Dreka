import QtQuick 2.12
import QtQuick.Controls 2.12

ApplicationWindow {
    id: main

    visible: true
    width: 1280
    height: 768

    Repeater {
        model: qmlUrls

        Loader {
            anchors.fill: parent
            source: modelData
        }
    }
}
