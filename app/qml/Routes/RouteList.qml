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
            visible: !controller.selectedRoute

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

        Loader {
            sourceComponent: controller.selectedRoute ? editComponent : listComponent
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }

    Component {
        id: listComponent

        Widgets.ListWrapper {
            emptyText: qsTr("No routes")
            model: controller.routeIds
            width: root.width
            delegate: Route {
                width: parent.width
                route: controller.routeData(modelData)
                onExpand: controller.selectRoute(modelData)
            }
        }
    }

    Component {
        id: editComponent

        RouteEdit {
            width: root.width
            route: controller.routeData(controller.selectedRoute)
            onCollapse: controller.selectRoute(null)
        }
    }
}
