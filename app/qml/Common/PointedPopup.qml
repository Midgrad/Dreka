import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

PointedItem {
    id: root

    readonly property bool opened: loader.sourceComponent != null

    property alias closePolicy: popup.closePolicy
    property alias source: loader.source
    property alias sourceComponent: loader.sourceComponent
    property alias item: loader.item

    function open(x, y, component) {
        loader.sourceComponent = component;
        popup.open();
        move(x, y);
    }

    pointed: Controls.Popup {
        id: popup
        onClosed: {
            root.hidePointer();
            loader.sourceComponent = null;
        }

        Loader {
            id: loader
            anchors.fill: parent
        }
    }
}
