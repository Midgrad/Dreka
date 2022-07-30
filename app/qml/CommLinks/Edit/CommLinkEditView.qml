import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka.CommLinks 1.0

Controls.Pane {
    id: root

    property alias selectedLinkId: editController.linkId
    readonly property alias link: editController.link

    signal collapse()

    onLinkChanged: if (!link.id) collapse()

    width: Controls.Theme.baseSize * 13

    CommLinkEditController { id: editController }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Label {
                text: qsTr("Link") + ":\t" + link.name
                Layout.fillWidth: true
            }

            Controls.Led {
                color: link.online ? Controls.Theme.colors.positive :
                                     Controls.Theme.colors.disabled
                Layout.alignment: Qt.AlignVCenter
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                highlightColor: Controls.Theme.colors.negative
                hoverColor: highlightColor
                iconSource: "qrc:/icons/remove.svg"
                enabled: !link.online
                tipText: qsTr("Remove")
                onClicked: editController.remove()
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: link.connected ? "qrc:/icons/connect.svg" : "qrc:/icons/disconnect.svg"
                tipText: link.connected ? qsTr("Comm link connected") : qsTr("Comm link disconnected")
                onClicked: editController.connectDisconectLink(!link.connected);
                Layout.alignment: Qt.AlignVCenter
            }
        }
    }
}

