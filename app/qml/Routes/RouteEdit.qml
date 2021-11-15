import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets

Item {
    id: root

    property var route

    property int _wptWidth: root.width * 0.3
    property int _typeWidth: root.width * 0.3
    property int _dstWidth: root.width * 0.2
    property int _altWidth: root.width * 0.2

    signal collapse()

    implicitWidth: column.implicitWidth
    implicitHeight: column.implicitHeight

    Connections {
        target: controller
        onWaypointAdded: if (route.id === routeId) route = controller.routeData(route.id)
        onWaypointRemoved: if (route.id === routeId) route = controller.routeData(route.id)
    }

    ColumnLayout {
        id: column
        anchors.fill: parent

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Button {
                flat: true
                rightCropped: true
                iconSource: "qrc:/icons/left.svg"
                tipText: qsTr("Back to routes")
                onClicked: collapse()
            }

            Controls.Label {
                text: route ? route.name : ""
                Layout.alignment: Qt.AlignVCenter
                Layout.fillWidth: true
            }

            Controls.Button {
                flat: true
                leftCropped: true
                highlightColor: Controls.Theme.colors.negative
                iconSource: "qrc:/icons/remove.svg"
                tipText: qsTr("Remove")
                onClicked: controller.removeRoute(route.id)
            }
        }

        RowLayout {
            spacing: 0
            Layout.fillWidth: true

            Controls.Label {
                type: Controls.Theme.Label
                text: qsTr("WPT")
                horizontalAlignment: Text.AlignHCenter
                Layout.minimumWidth: _wptWidth
            }

            Controls.Label {
                type: Controls.Theme.Label
                text: qsTr("TYPE")
                horizontalAlignment: Text.AlignHCenter
                Layout.minimumWidth: _typeWidth
            }

            Controls.Label {
                type: Controls.Theme.Label
                text: qsTr("DIST")
                horizontalAlignment: Text.AlignHCenter
                Layout.minimumWidth: _dstWidth
            }

            Controls.Label {
                type: Controls.Theme.Label
                text: qsTr("ALT")
                horizontalAlignment: Text.AlignHCenter
                Layout.minimumWidth: _altWidth
            }
        }

        Widgets.ListWrapper {
            id: list
            model: route ? route.waypoints : []
            emptyText: qsTr("No Waypoints")
            delegate: WaypointListItem {
                width: parent.width
                waypoint: controller.waypointData(route.id, modelData)
                waypointIndex: index
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
