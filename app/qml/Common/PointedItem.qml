import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var pointed: Item {}

    property real minX: Controls.Theme.margins
    property real minY: Controls.Theme.margins
    property real maxX: width - Controls.Theme.margins * 2
    property real maxY: height - Controls.Theme.margins * 2

    property int highlightWidth: 8

    function move(x, y) {
        var pX = x - pointed.width / 2;
        var pY = y - pointed.height - pointer.height;
        var pointerVisible = true;
        if (pX < minX) {
            pointerVisible = false;
            pX = minX;
        } else if (pX > maxX - pointed.width) {
            pointerVisible = false;
            pX = maxX - pointed.width;
        }

        if (pY < minY) {
            pointerVisible = false;
            pY = minY;
        } else if (pY > maxY - pointed.height) {
            pointerVisible = false;
            pY = maxY - pointed.height;
        }

        pointed.x = pX;
        pointed.y = pY;
        pointer.visible = pointerVisible;
    }

    function close() { pointed.close(); }
    function hidePointer() { pointer.visible= false; }

    Pointer {
        id: pointer
        x: pointed.x + pointed.width / 2 - width / 2
        y: pointed.y + pointed.height
        visible: false
    }

    Rectangle {
        id: hightlight
        anchors.bottom: pointer.bottom
        anchors.bottomMargin: -highlightWidth / 2
        anchors.horizontalCenter: pointer.horizontalCenter
        color: Controls.Theme.colors.highlight
        width: highlightWidth
        height: highlightWidth
        rotation: 45
        visible: pointer.visible
    }
}
