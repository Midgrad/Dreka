import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

RowLayout {
    id: root

    MapRulerController {
        id: ruler
    }

    Component.onCompleted: webChannel.registerObject("rulerController", ruler)

    property real distance: ruler.distance

    spacing: 1

    MapButton {
        rightCropped: !ruler.empty
        tipText: checked ? qsTr("Disable ruler") : qsTr("Enable ruler")
        iconSource: "../app/icons/ruler.svg"
        checkable: true
        onCheckedChanged: ruler.rulerMode = checked
    }

    MapButton {
        rightCropped: true
        leftCropped: true
        tipText: qsTr("Copy distance")
        visible: !ruler.empty
        text: distance > 1000 ? (Math.round(distance / 1000) + " " + qsTr("km")):
                                (Math.round(distance) + " " + qsTr("m"))
        onClicked: clipboard.setText(text)
        Layout.fillWidth: true
    }

    MapButton {
        leftCropped: true
        tipText: qsTr("Remove ruler points")
        iconSource: "../app/icons/remove.svg"
        visible: !ruler.empty
        onClicked: ruler.clear()
    }
}
