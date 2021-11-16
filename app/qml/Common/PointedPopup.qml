import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property alias closePolicy: popup.closePolicy
    property alias source: loader.source
    property alias sourceComponent: loader.sourceComponent

    function open(x, y, component) {
        loader.sourceComponent = component;
        move(x, y);
        popup.open();
    }

    function move(x, y) {
        popup.x = x - popup.width / 2;
        popup.y = y - popup.height - pointer.height;
    }

    function close() { popup.close(); }

    Controls.Popup {
        id: popup
        onClosed: loader.sourceComponent = null

        Loader {
            id: loader
            anchors.fill: parent
        }
    }

    Pointer {
        id: pointer
        x: popup.x + popup.width / 2 - width / 2
        y: popup.y + popup.height
        visible: popup.visible
    }
}
