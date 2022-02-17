import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets

Controls.Frame {
    id: root

    property var routeId
    property var route: controller.routeData(routeId)

    property bool editName: false

    width: Controls.Theme.baseSize * 13

    Connections {
        target: controller
        onRouteItemAdded: if (routeId === root.routeId) route = controller.routeData(route.id)
        onRouteChanged: if (routeId === root.routeId) route = controller.routeData(routeId)
        onRouteItemRemoved: if (routeId === root.routeId) route = controller.routeData(route.id)
    }

    ColumnLayout {
        id: column
        anchors.fill: parent

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Button {
                flat: true
                rightCropped: true
                text: route.id ? route.name : ""
                tipText: qsTr("Edit name")
                visible: !editName
                onClicked: editName = true
                Layout.fillWidth: true
            }

            Controls.TextField {
                id: nameEdit
                flat: true
                visible: editName
                Binding on text { value: route ? route.name : ""; when: !nameEdit.activeFocus }
                onEditingFinished: {
                    controller.renameRoute(route.id, text);
                    editName = false;
                }
                Layout.fillWidth: true
            }

            Controls.Label {
                text: route.id ? route.type : ""
                type: Controls.Theme.Label
            }

            Controls.Button {
                flat: true
                leftCropped: true
                highlightColor: Controls.Theme.colors.negative
                iconSource: "qrc:/icons/remove.svg"
                enabled: route.id && !route.block
                tipText: qsTr("Remove")
                onClicked: controller.removeRoute(route.id)
            }
        }

        Widgets.ListWrapper {
            id: list
            model: route ? route.items : []
            emptyText: qsTr("No route items")
            delegate: RouteItemListItem {
                width: parent.width
                selected: index === controller.selectedRouteItemIndex
                routeItem: controller.routeItemData(route.id, modelData)
                inRouteIndex: index
                onClicked: controller.selectRouteItemIndex(index)
            }
            Component.onCompleted: toIndex(controller.selectedRouteItemIndex, ListView.Center)
            Layout.fillWidth: true
            Layout.fillHeight: true
        }

        Controls.Separator {
            color: Controls.Theme.colors.text
            visible: itemEdit.visible
            opacity: 0.33
            Layout.fillWidth: true
        }

        RouteItemEditView {
            id: itemEdit
            visible: !!routeItem.id
            route: controller.selectedRoute
            inRouteIndex: controller.selectedRouteItemIndex
            onSelectRouteItemIndex: controller.selectRouteItemIndex(index)
            onCenter: controller.centerRouteItem(route, inRouteIndex)
            onRemove: controller.removeRouteItem(route, inRouteIndex)
            onInRouteIndexChanged: list.toIndex(inRouteIndex, ListView.Center);
            Layout.fillWidth: true
        }
    }
}
