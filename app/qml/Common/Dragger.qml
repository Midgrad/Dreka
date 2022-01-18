import QtQuick 2.12

MouseArea {
    id: root

    property point lastMousePos: Qt.point(0, 0)
    property QtObject target: parent

    anchors.fill: parent
    preventStealing: true

    onPressed: lastMousePos = Qt.point(mouseX, mouseY)
    onMouseXChanged: target.x += (mouseX - lastMousePos.x)
    onMouseYChanged: target.y += (mouseY - lastMousePos.y)
}
