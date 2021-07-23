import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

MapButton {
    tipText: checked ? qsTr("Disable grid") : qsTr("Enable grid")
    iconSource: "../app/icons/grid.svg"
    checkable: true
    onCheckedChanged: grid.enabled = checked
}
