import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

MapButton {
    id: root

    MapGridController { id: grid }

    Component.onCompleted: map.registerController("gridController", grid)

    tipText: checked ? qsTr("Disable grid") : qsTr("Enable grid")
    iconSource: "qrc:/icons/grid.svg"
    checkable: true
    onCheckedChanged: grid.enabled = checked
}
