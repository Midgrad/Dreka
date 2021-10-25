import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka 1.0

Controls.Popup {
    id: root

    closePolicy: Controls.Popup.NoAutoClose
    width: Controls.Theme.baseSize * 15
    height: Math.min(implicitHeight, main.availableHeight)

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.FilterField {
                id: filterField
                flat: true
                placeholderText: qsTr("Filter routes")
                Layout.fillWidth: true
            }

            Controls.MenuButton {
                flat: true
                iconSource: "qrc:/icons/plus.svg"
                model: controller.routeTypes
                delegate: Controls.MenuItem {
                    text: modelData
                    onTriggered: controller.addNewRoute(modelData)
                }
            }
        }

        Widgets.ListWrapper {
            emptyText: qsTr("No Missions")
            model: controller.routes
            delegate: Widgets.ListItem {
                width: parent.width
                color: "transparent"
                expanded: controller.selectedRoute === modelData
                expandedItem: RouteEdit {
                    route: controller.route(modelData)
                    onCollapse: controller.selectRoute(null)
                }
                collapsedItem: Route {
                    route: controller.route(modelData)
                    onExpand: controller.selectRoute(modelData)
                }
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
