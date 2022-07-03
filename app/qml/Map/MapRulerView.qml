import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    MapRulerController { id: controller }

    Component.onCompleted: map.registerController("rulerController", controller)

    readonly property alias distance: controller.distance

    spacing: 1

    MapButton {
        rightCropped: !controller.empty
        tipText: checked ? qsTr("Disable ruler") : qsTr("Enable ruler")
        iconSource: "qrc:/icons/ruler.svg"
        checkable: true
        onCheckedChanged: controller.setRulerMode(checked)
    }

    MapButton {
        rightCropped: true
        leftCropped: true
        tipText: qsTr("Copy distance")
        visible: !controller.empty
        text: distance > 1000 ? ((Math.round(distance / 100) * 0.1).toFixed(1) + " " + qsTr("km")):
                                (Math.round(distance) + " " + qsTr("m"))
        onClicked: clipboardController.setText(text)
        Layout.fillWidth: true
    }

    MapButton {
        leftCropped: true
        tipText: qsTr("Remove ruler points")
        iconSource: "qrc:/icons/remove.svg"
        visible: !controller.empty
        onClicked: controller.clear()
    }
}
