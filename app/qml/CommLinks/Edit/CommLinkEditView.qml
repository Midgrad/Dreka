import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Controls.Pane {
    id: root

    property var selectedLinkId

    width: Controls.Theme.baseSize * 13

    // LinkEditController { id: editController }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Label {
                text: qsTr("Link") //+ ":\t" + editController.linkName
                Layout.fillWidth: true
            }

            Controls.Led {
                //color: editController.connected ? Controls.Theme.colors.positive :
                //                                  Controls.Theme.colors.disabled
                Layout.alignment: Qt.AlignVCenter
            }
        }
    }
}

