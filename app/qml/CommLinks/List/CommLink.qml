import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

// TODO: Common list item
Item {
    id: root

    property var commLink
    property bool selected

    signal expand()

    Connections {
        target: controller
        onCommLinkChanged: if (commLinkId === root.commLink.id) root.commLink = commLink
    }

    implicitWidth: row.implicitWidth
    implicitHeight: Controls.Theme.baseSize * 1.5

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        onClicked: if (!selected) expand()
    }

    Rectangle {
        anchors.fill: parent
        opacity: 0.20
        color: {
            if (selected)
                return Controls.Theme.colors.description;
            return mouseArea.containsMouse ? Controls.Theme.colors.highlight : "transparent"
        }
        radius: Controls.Theme.rounding
    }

    RowLayout {
        id: row
        anchors.fill: parent
        anchors.leftMargin: Controls.Theme.margins
        spacing: Controls.Theme.spacing

        ColumnLayout {
            spacing: 1

            Controls.Label {
                text: commLink.name
                Layout.alignment: Qt.AlignVCenter
            }

            Controls.Label {
                text: commLink.type
                type: Controls.Theme.Label
                Layout.alignment: Qt.AlignVCenter
            }
        }

        Item { Layout.fillWidth: true }

        Controls.Led {
            color: commLink.online ? Controls.Theme.colors.positive : Controls.Theme.colors.disabled
            Layout.rightMargin: Controls.Theme.margins
        }

        Controls.Button {
            flat: true
            leftCropped: true
            rightCropped: true
            iconSource: commLink.connected ? "qrc:/icons/connect.svg" : "qrc:/icons/disconnect.svg"
            tipText: commLink.connected ? qsTr("Comm link connected") : qsTr("Comm link disconnected")
            onClicked: controller.connectDisconectLink(commLink.id, !commLink.connected);
            Layout.alignment: Qt.AlignVCenter
        }

        Controls.ColoredIcon {
            implicitWidth: Controls.Theme.iconSize
            implicitHeight: width
            source: "qrc:/icons/right.svg"
            Layout.alignment: Qt.AlignVCenter
            Layout.rightMargin: Controls.Theme.padding
        }
    }
}

