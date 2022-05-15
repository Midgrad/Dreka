import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var mission
    property bool selected

    signal expand()
    signal remove()

    Connections {
        target: controller
        onMissionChanged: if (missionId === root.mission.id) root.mission = mission
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
                text: mission ? mission.name : ""
                Layout.alignment: Qt.AlignVCenter
                Layout.maximumWidth: Controls.Theme.baseSize * 5
            }

            Controls.Label {
                text: mission ? mission.type : ""
                type: Controls.Theme.Label
                Layout.alignment: Qt.AlignVCenter
            }
        }

        Item { Layout.fillWidth: true }

        Controls.Button {
            flat: true
            leftCropped: true
            rightCropped: true
            iconSource: "qrc:/icons/center.svg"
            tipText: qsTr("Center mission")
            onClicked: missionsMapController.centerMission(mission.id)
            Layout.alignment: Qt.AlignVCenter
        }

        Controls.Button {
            flat: true
            leftCropped: true
            rightCropped: true
            iconSource: mission.visible ? "qrc:/icons/password_show.svg" :
                                          "qrc:/icons/password_hide.svg"
            tipText: mission.visible ? qsTr(" mission visible") : qsTr(" mission hidden")
            onClicked: missionsMapController.updateVisibility(mission.id, !mission.visible);
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

