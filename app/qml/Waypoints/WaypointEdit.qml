import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

import "../Common"

Item {
    id: root

    property var waypoint
    property int waypointIndex: -1

    property bool editName: false
    property var selectedItem: waypointEdit

    implicitWidth: Controls.Theme.baseSize * 11
    implicitHeight: column.implicitHeight

    ColumnLayout {
        id: column
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Button {
                enabled: waypoint
                flat: true
                rightCropped: true
                text: waypoint ? (waypoint.name + " " + (waypointIndex + 1)) : "-"
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
                    value: waypoint ? waypoint.name : "-"
                    when: !nameEdit.activeFocus
                }
                onEditingFinished: {
                    controller.renameWaypoint(text);
                    editName = false;
                }
                Layout.fillWidth: true
            }

            Controls.ComboBox {
                id: wptTypeBox
                flat: true
                model: controller.waypointTypes
                textRole: "name"
                currentIndex: {
                    if (!waypoint)
                        return -1;

                    var types = controller.waypointTypes;
                    for (var i = 0; i < types.length; ++i) {
                        if (waypoint.type === types[i].id)
                            return i;
                    }
                    return -1;
                }
                onActivated: controller.changeWaypointItemType(currentItem.id);
                Layout.fillWidth: true
            }

            Controls.Button {
                flat: true
                leftCropped: true
                iconSource: "qrc:/icons/close.svg"
                tipText: qsTr("Close")
                onClicked: editor.close()
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

                ListElement {
                    text: qsTr("Waypoint")
                    expanded: selectedItem == waypointEdit
                    onExpand: selectedItem = waypointEdit
                    Layout.fillWidth: true

                    Controls.Button {
                        flat: true
                        leftCropped: true
                        iconSource: "qrc:/icons/center.svg"
                        tipText: qsTr("Goto on map")
                        onClicked: controller.centerWaypoint(waypoint.route, waypointIndex)
                    }
                }

                ParametersEdit {
                    id: waypointEdit
                    visible: selectedItem == waypointEdit
                    parameters: controller.typeParameters(waypoint.type)
                    parameterValues: controller.waypointParameters
                    onParameterChanged: controller.setWaypointParameter(id, value)
                    Layout.fillWidth: true
                    Layout.leftMargin: Controls.Theme.margins
                }

                ListElement {
                    text: qsTr("Payloads")
                    buttonEnabled: !expanded && waypoint.routeItems.length
                    expanded: selectedItem == payloadsList
                    onExpand: selectedItem = payloadsList
                    Layout.fillWidth: true

                    Controls.Label {
                        text: "(" + waypoint.routeItems.length + ")"
                        type: Controls.Theme.Label
                    }

                    Controls.MenuButton {
                        flat: true
                        leftCropped: true
                        iconSource: "qrc:/icons/plus.svg"
                        tipText: qsTr("Add Payload")
                        model: controller.waypointItemTypes
                        textRole: "name"
                        onTriggered: {
                            controller.addWaypointItem(modelData.id);
                            if (waypoint.routeItems.length) {
                                selectedItem = payloadsList;
                            }
                        }
                    }
                }

                ColumnLayout {
                    id: payloadsList
                    visible: selectedItem == payloadsList
                    spacing: 1
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    Layout.leftMargin: Controls.Theme.margins

                    Repeater {
                        model: waypoint.items
                        onCountChanged: {
                            if (count == 0 && selectedItem == payloadsList)
                                selectedItem = waypointEdit
                        }

                        PayloadListItem {
                            payload: modelData
                            payloadIndex: index
                            width: parent.width
                        }
                    }
                }
            }

            Controls.ScrollBar.vertical: Controls.ScrollBar {
                visible: properties.height > root.height
            }
        }
    }
}
