import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Item {
    id: root

    property alias route: controller.route
    property alias inRouteIndex: controller.inRouteIndex
    readonly property alias routeItem : controller.routeItem

    property bool editName: false

    signal selectRouteItemIndex(int index)

    onInRouteIndexChanged: editName = false

    implicitWidth: Controls.Theme.baseSize * 11
    implicitHeight: column.implicitHeight

    RouteItemEditController {
        id: controller
    }

    ColumnLayout {
        id: column
        anchors.fill: parent
        spacing: 1

        RowLayout {
            spacing: 1

            Controls.Button {
                flat: true
                rightCropped: true
                enabled: inRouteIndex > 0
                iconSource: "qrc:/icons/left.svg"
                tipText: qsTr("Left")
                onClicked: selectRouteItemIndex(inRouteIndex - 1)
            }

            Controls.Button {
                enabled: routeItem
                flat: true
                leftCropped: true
                rightCropped: true
                text: routeItem ? (routeItem.name + " " + (inRouteIndex + 1)) : "-"
                tipText: qsTr("Edit name")
                visible: !editName
                onClicked: editName = true
                Layout.fillWidth: true
            }

            Controls.TextField {
                id: nameEdit
                flat: true
                visible: editName
                Binding on text {
                    value: routeItem ? routeItem.name : "-"
                    when: !nameEdit.activeFocus
                }
                onEditingFinished: {
                    controller.rename(text);
                    editName = false;
                }
                Layout.fillWidth: true
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                enabled: inRouteIndex < controller.routeItemsCount - 1
                iconSource: "qrc:/icons/right.svg"
                tipText: qsTr("Right")
                onClicked: selectRouteItemIndex(inRouteIndex + 1);
            }

            // TODO: controller.centerRouteItem(routeItem.route, inRouteIndex);

            Controls.Button {
                flat: true
                leftCropped: true
                iconSource: "qrc:/icons/close.svg"
                tipText: qsTr("Close")
                onClicked: selectRouteItemIndex(-1)
            }
        }

        Flickable {
            implicitHeight: properties.height
            contentHeight: properties.implicitHeight
            flickableDirection: Flickable.VerticalFlick
            boundsBehavior: Flickable.StopAtBounds
            clip: true
            Layout.fillWidth: true
            Layout.fillHeight: true

            ColumnLayout {
                id: properties
                width: parent.width
                spacing: 1

                RowLayout {
                    spacing: 1

                    Controls.Label {
                        text: qsTr("Type")
                        Layout.minimumWidth: parametersEdit.labelWidth
                    }

                    Controls.ComboBox {
                        id: itemTypeBox
                        flat: true
                        model: controller.itemTypes
                        textRole: "name"
                        currentIndex: {
                            if (!routeItem)
                                return -1;

                            var types = controller.itemTypes;
                            for (var i = 0; i < types.length; ++i) {
                                if (routeItem.type === types[i].id)
                                    return i;
                            }
                            return -1;
                        }
                        onActivated: controller.changeItemType(currentItem.id);
                        Layout.fillWidth: true
                    }
                }

                PositionEdit {
                    latitude: routeItem && routeItem.position ? routeItem.position.latitude : NaN
                    longitude: routeItem && routeItem.position ? routeItem.position.longitude : NaN
                    altitude: routeItem && routeItem.position ? routeItem.position.altitude : NaN
                    onChanged: controller.setPosition(latitude, longitude, altitude)
                }

                RowLayout {
                    spacing: 1
// TODO: Alt. AGL
//                    Controls.Label {
//                        text: qsTr("Alt. AGL, m")
//                        Layout.minimumWidth: parametersEdit.labelWidth
//                    }

//                    Controls.SpinBox {
//                        enabled: false
//                        flat: true
//                        value: routeItem && routeItem.calcData && routeItem.calcData.terrainAltitude ?
//                                   routeItem.calcData.terrainAltitude : 0
//                        from: 0
//                        to: 1000000
//                        isValid: value > 0
//                        Layout.fillWidth: true
//                    }
                }

                ParametersEdit {
                    id: parametersEdit
                    parameters: controller.typeParameters(routeItem.type)
                    parameterValues: controller.itemParameters
                    onParameterChanged: controller.setParameter(id, value)
                    Layout.fillWidth: true
                }
            }
        }
    }
}
