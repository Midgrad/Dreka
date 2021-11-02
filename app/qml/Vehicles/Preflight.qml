import QtQuick 2.6
import QtQuick.Layouts 1.3
import Industrial.Controls 1.0 as Controls
import Industrial.Indicators 1.0 as Indicators

Controls.Popup {
    id: root

    property int fails: 0

    width: Controls.Theme.baseSize * 5

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        Repeater {
            model: params.devices ? params.devices : []

            delegate: ChecklistItem {
                visible: modelData.present
                text: modelData.name
                failed: !modelData.health
                active: modelData.enabled && guardBool(params.online)
                onFailedChanged: failed ? fails++ : fails --
                Layout.fillWidth: true
            }
        }

        Item {
            Layout.minimumHeight: Controls.Theme.padding
            Layout.fillHeight: true
        }

        Controls.DelayButton {
            flat: true
            borderColor: Qt.darker(Controls.Theme.colors.negative, 2)
            fillColor: borderColor
            text: params.armed ? qsTr("Disarm throttle"): qsTr("Arm throttle")
            onActivated: controller.sendCommand("setArmed", [ !params.armed ])
            Layout.fillWidth: true
        }
    }
}
