import QtQuick 2.12
import Industrial.Controls 1.0 as Controls

// Unify dragging and pointed items on map
Item {
    id: root

    property var pointed: Item {}

    property color pointerColor: Controls.Theme.colors.background

    property real lastX: -1.0
    property real lastY: -1.0
    property real minX: Controls.Theme.margins
    property real minY: Controls.Theme.margins
    property real maxX: width - Controls.Theme.margins * 2
    property real maxY: height - Controls.Theme.margins * 2
    property bool pointerVisible: true

    property int highlightWidth: 8

    function move(x, y) {
        lastX = x;
        lastY = y;

        if (pointerVisible) {
            pointed.x = Qt.binding(function() {
                return Math.max(Math.min(x - pointed.width / 2, maxX - pointed.width), minX);
            });
            pointed.y = Qt.binding(function() {
                return Math.max(Math.min(y - pointed.height - pointer.height, maxY - pointed.height), minY);
            });
            pointer.visible = Qt.binding(function() {
                return pointed.x > minX && pointed.x < maxX - pointed.width &&
                        pointed.y > minY && pointed.y < maxY - pointed.height;
            });
        } else {
            pointer.visible = false;
        }
    }

    function close() { pointed.close(); }
    function hidePointer() { pointer.visible= false; }

    onPointerVisibleChanged: pointerVisible ? move(lastX, lastY) : pointer.visible = false

    Item {
        id: pointer
        x: pointed.x + pointed.width / 2 - width / 2
        y: pointed.y + pointed.height
        width: Controls.Theme.baseSize
        height: Controls.Theme.baseSize / 2
        visible: false
        clip: true

        Rectangle {
            anchors.centerIn: parent
            anchors.verticalCenterOffset: -parent.height
            width: parent.width
            height: width
            rotation: 45
            color: pointerColor
        }
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
