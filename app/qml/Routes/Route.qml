import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets

Widgets.ListWrapper {
    id: root

    property var route

    model: route ? route.waypoints : []
    emptyText: qsTr("No Waypoints")
    delegate: Widgets.ListItem {
        width: parent.width
        color: "transparent"
        expanded: root.currentIndex === index
        collapsedItem: WaypointView {
            waypointIndex: index
            waypoint: modelData
            onExpand: root.currentIndex = index
        }
        expandedItem: WaypointEditView {
            waypoint: modelData
            onCollapse: root.currentIndex = -1
        }
    }
}
