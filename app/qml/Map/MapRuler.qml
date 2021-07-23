import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

RowLayout {
    id: row

    spacing: 1

    MapButton {
        id: rulerButton
        rightCropped: removeRullerButton.visible
        iconSource: "../app/icons/ruler.svg"
        checkable: true
        onCheckedChanged: ruler.rulerMode = checked
    }

    MapButton {
        id: removeRullerButton
        leftCropped: true
        iconSource: "../app/icons/remove.svg"
        visible: !ruler.empty
        onClicked: ruler.clear()
    }
}
