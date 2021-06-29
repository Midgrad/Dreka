import QtQuick 2.12
import QtQuick.Controls 2.12
import QtWebEngine 1.3

ApplicationWindow {
    id: main

    visible: true
    width: 1280
    height: 768

    WebEngineView {
        anchors.fill: parent
        url: "../web/index.html"
        onLoadProgressChanged: {
            if (loadProgress !== 100)
                return;

            // Fly the camera to Goretovka at the given longitude, latitude, and height.
            runJavaScript("weremap.viewport.goTo(55.97101, 37.10610, 400, 0.0, -15.0)");
        }
    }
}
