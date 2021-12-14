import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

PointedItem {
    id: root

    property alias closePolicy: popup.closePolicy
    property alias source: loader.source
    property alias sourceComponent: loader.sourceComponent

    function open(x, y, component) {
        loader.sourceComponent = component;
        move(x, y);
        popup.open();
    }

    signal closed()

    pointed: Controls.Popup {
        id: popup
        onClosed: {
            root.hidePointer();
            loader.sourceComponent = null;
            root.closed();
        }

        Loader {
            id: loader
            anchors.fill: parent
        }
    }
}
