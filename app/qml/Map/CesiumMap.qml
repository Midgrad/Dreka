import QtQuick 2.12
import QtQuick.Layouts 1.12
import QtWebEngine 1.3
import QtWebChannel 1.0
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Item {
    id: root

    readonly property alias centerPosition: mapControl.centerPosition

    readonly property real controlHeight: mapControl.height + Controls.Theme.margins * 2

    function registerController(id, controller) {
        webChannel.registerObject(id, controller);
    }

    WebEngineView {
        anchors.fill: parent
        url: "file:" + applicationDirPath + "/web/index.html"
        webChannel: WebChannel { id: webChannel }
        onJavaScriptConsoleMessage: console.log(message)
    }

    MapCross {
        anchors.centerIn: parent
        visible: mapControl.crossMode
    }

    MapControlView {
        id: mapControl
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.margins: Controls.Theme.margins
    }
}
