import QtQuick 2.6
import QtGraphicalEffects 1.0
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property color color: Controls.Theme.colors.text
    property real thickness: 2

    implicitWidth: implicitHeight
    implicitHeight: Controls.Theme.baseSize
    visible: Controls.Theme.baseSize

    onWidthChanged: canvas.requestPaint()
    onHeightChanged: canvas.requestPaint()
    onColorChanged: canvas.requestPaint()
    onThicknessChanged: canvas.requestPaint()

    Canvas {
        id: canvas
        visible: false
        anchors.fill: parent

        onPaint: {
            var ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, width, height);

            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;

            ctx.save();
            ctx.beginPath();

            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);

            ctx.stroke();
            ctx.restore();
        }
    }

    DropShadow {
        id: shadow
        anchors.fill: canvas
        radius: 4.0
        samples: 14
        color: Controls.Theme.colors.shadow
        source: canvas
    }
}

