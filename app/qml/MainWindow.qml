import QtQuick 2.12
import QtQuick.Controls 2.12

ApplicationWindow {
    id: main

    visible: true
    width: 1280
    height: 768

    Map {
        id: map
        anchors.fill: parent
    }
}
