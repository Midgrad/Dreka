import QtQuick 2.6
import QtQuick.Layouts 1.3
import Industrial.Controls 1.0 as Controls
import Industrial.Indicators 1.0 as Indicators

ColumnLayout {
    id: root

    property int fails: 0

    width: Controls.Theme.baseSize * 5
    spacing: 0

    Repeater {
        model: params.devices ? params.devices : []

        delegate: ChecklistItem {
            visible: modelData.present
            text: modelData.name
            failed: !modelData.health
            active: modelData.enabled && online
            onFailedChanged: failed ? fails++ : fails --
            Layout.fillWidth: true
        }
    }

    Item {
        Layout.minimumHeight: Controls.Theme.padding
        Layout.fillWidth: true
        Layout.fillHeight: true
    }
}
