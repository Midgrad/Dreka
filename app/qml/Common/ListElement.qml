import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

RowLayout {
    id: root

    property bool expanded: false
    property alias text: button.text
    property alias buttonEnabled: button.enabled

    signal expand()

    spacing: 1

    Controls.Button {
        id: button
        flat: true
        rightCropped: root.visibleChildren.length > 1
        horizontalAlignment: Text.AlignLeft
        disabledColor: textColor
        enabled: !expanded
        iconSource: expanded ? "/icons/down.svg" : "/icons/right.svg"
        onClicked: expand()
        Layout.fillWidth: true
    }
}
