import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var routeId
    property var route: controller.routeData(routeId)

    signal expand()

    Connections {
        target: controller
        onMissionChanged: if (routeId === root.routeId) route = controller.routeData(routeId)
    }

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
                text: route ? route.name : ""
                Layout.alignment: Qt.AlignVCenter
                Layout.maximumWidth: Controls.Theme.baseSize * 5
            }

            Controls.Label {
                text: route ? route.type : ""
                type: Controls.Theme.Label
                Layout.alignment: Qt.AlignVCenter
            }
        }

        Item { Layout.fillWidth: true }

        RowLayout {
            spacing: 1

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: "qrc:/icons/center.svg"
                tipText: qsTr("Center on route")
                onClicked: controller.centerRoute(route.id)
                Layout.alignment: Qt.AlignVCenter
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: route.visible ? "qrc:/icons/password_show.svg" :
                                            "qrc:/icons/password_hide.svg"
                tipText: route.visible ? qsTr("Route visible") : qsTr("Route hidden")
                onClicked: {
                    route.visible = !route.visible;
                    controller.updateRoute(route.id, route);
                }
                Layout.alignment: Qt.AlignVCenter
            }
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
