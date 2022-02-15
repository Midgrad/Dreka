import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var routeItem
    property bool selected: false
    property int inRouteIndex: 0

    signal clicked()

    Connections {
        target: controller
        onRouteItemChanged: if (route.id === routeId && inRouteIndex === index)
                               routeItem = controller.routeItemData(route.id, inRouteIndex)
    }

    implicitWidth: row.implicitWidth
    implicitHeight: row.implicitHeight

    Rectangle {
        id: hover
        anchors.fill: parent
        opacity: 0.20
        color: selected ? Controls.Theme.colors.text : mouseArea.containsMouse
                        ? Controls.Theme.colors.highlight : "transparent"
        radius: Controls.Theme.rounding
    }

    MouseArea {
        id: mouseArea
        hoverEnabled: true
        anchors.fill: parent
        onClicked: root.clicked()
    }

    RowLayout {
        id: row
        anchors.fill: parent
        spacing: 0

        Controls.Label {
            text: routeItem ? routeItem.name + " " + (inRouteIndex + 1) : ""
            Layout.minimumWidth: _wptWidth
        }

        Controls.Label {
            text: routeItem ? routeItem.type : ""
            type: Controls.Theme.Label
            Layout.minimumWidth: _typeWidth
        }
    }
}
