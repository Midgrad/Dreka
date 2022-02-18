import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item { // TODO: base expandable
    id: root

    property var mission

    signal expand()

    implicitWidth: row.implicitWidth
    implicitHeight: Controls.Theme.baseSize * 1.5

    Rectangle {
        id: hover
        anchors.fill: parent
        opacity: 0.20
        color: mouseArea.containsMouse ? Controls.Theme.colors.highlight : "transparent"
        radius: Controls.Theme.rounding
    }

    MouseArea {
        id: mouseArea
        hoverEnabled: true
        anchors.fill: parent
        onClicked: expand()
    }

    RowLayout {
        id: row
        anchors.fill: parent
        anchors.leftMargin: Controls.Theme.margins
        spacing: Controls.Theme.spacing

        ColumnLayout {
            spacing: 1

            Controls.Label {
                text: mission ? mission.name : ""
                Layout.alignment: Qt.AlignVCenter
            }

            Controls.Label {
                text: mission.id ? mission.type : ""
                type: Controls.Theme.Label
            }
        }

        Item { Layout.fillWidth: true }

        Controls.ColoredIcon {
            implicitWidth: Controls.Theme.iconSize
            implicitHeight: width
            source: "qrc:/icons/right.svg"
            Layout.alignment: Qt.AlignVCenter
            Layout.rightMargin: Controls.Theme.padding
        }
    }
}
