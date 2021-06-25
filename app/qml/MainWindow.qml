import QtQuick 2.6
import QtQuick.Controls 2.12
import QtWebEngine 1.0

ApplicationWindow {
    id: main

    visible: true
    width: 1280
    height: 768

    WebEngineView {
        anchors.fill: parent
        url: "../html/index.html"
    }
}
