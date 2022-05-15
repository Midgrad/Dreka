import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka.Missions 1.0

ColumnLayout {
    id: root

    property alias selectedMissionId : routeController.missionId
    readonly property alias count: routeController.count

    property int selectedIndex: -1

    MissionRouteController { id: routeController }

    RowLayout {
        spacing: 0

        Controls.Button {
            tipText: qsTr("Left")
            iconSource: "qrc:/icons/left.svg"
            flat: true
            rightCropped: true
            enabled: selectedIndex > 0
            onClicked: selectedIndex--
            onPressAndHold: selectedIndex = 0
        }

        Controls.Label {
            text: qsTr("No route items")
            horizontalAlignment: Text.AlignHCenter
            visible: !count
            Layout.fillWidth: true
        }

        ListView {
            id: list
            visible: count
            boundsBehavior: Flickable.StopAtBounds
            orientation: ListView.Horizontal
            spacing: 1
            clip: true
            model: routeController.routeItems
            currentIndex: selectedIndex
            delegate: MissionRouteItem {
                anchors.verticalCenter: parent.verticalCenter
                routeItem: modelData
                inRouteIndex: index
                onSelectRequest: selectedIndex = index
            }
            highlight: Item {
                x: list.currentItem ? list.currentItem.x : 0
                width: list.currentItem ? list.currentItem.width : 0

                Rectangle {
                    width: parent.width
                    anchors.bottom: parent.bottom
                    height: Controls.Theme.underline
                    color: Controls.Theme.colors.highlight
                }

                Behavior on x { NumberAnimation { duration: Controls.Theme.animationTime } }
                Behavior on width { NumberAnimation { duration: Controls.Theme.animationTime } }
            }

            Layout.fillWidth: true
            Layout.fillHeight: true
        }

        Controls.Button {
            tipText: qsTr("Right")
            iconSource: "qrc:/icons/right.svg"
            leftCropped: true
            flat: true
            enabled: selectedIndex + 1 < count
            onClicked: selectedIndex++
            onPressAndHold: selectedIndex = count - 1
        }

//        Controls.MenuButton {
//            tipText: qsTr("Add mission item")
//            iconSource: "qrc:/ui/plus.svg"
//            flat: true
//        }
    }
}
