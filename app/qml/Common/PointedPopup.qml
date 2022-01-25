import QtQuick 2.12
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

        width: loader.implicitWidth + padding * 2
        height: loader.implicitHeight + padding * 2

        Dragger {
            target: popup
            anchors.margins: -popup.padding
            enabled: !root.pointerVisible
        }

        Loader {
            id: loader
            anchors.fill: parent
        }
    }
}
