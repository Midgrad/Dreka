import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

import "../Common"

Item {
    id: root

    property var waypoint
    property int waypointIndex: -1

    property bool editName: false

    implicitWidth: Controls.Theme.baseSize * 11
    implicitHeight: column.implicitHeight

    ColumnLayout {
        id: column
        anchors.fill: parent
        spacing: 1

        RowLayout {
            spacing: 1

            Controls.Button {
                flat: true
                rightCropped: true
                enabled: waypointIndex > 0
                iconSource: "qrc:/icons/left.svg"
                tipText: qsTr("Left")
                onClicked: controller.setWaypointIndex(waypointIndex - 1)
            }

            Controls.Button {
                enabled: waypoint
                flat: true
                leftCropped: true
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

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                enabled: waypointIndex < controller.waypointsCount - 1
                iconSource: "qrc:/icons/right.svg"
                tipText: qsTr("Right")
                onClicked: controller.setWaypointIndex(waypointIndex + 1)
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: "qrc:/icons/plus.svg"
                tipText: qsTr("Add item after current")
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconColor: Controls.Theme.colors.negative
                iconSource: "qrc:/icons/remove.svg"
                tipText: qsTr("Remove item")
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: "qrc:/icons/center.svg"
                tipText: qsTr("Goto on map")
                onClicked: controller.centerWaypoint(waypoint.route, waypointIndex)
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

                RowLayout {
                    spacing: 1

                    Controls.Label {
                        text: qsTr("Type")
                        Layout.minimumWidth: parametersEdit.labelWidth
                    }

                    Controls.ComboBox {
                        id: itemTypeBox
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
                }

                PositionEdit {
                    latitude: waypoint && waypoint.position ? waypoint.position.latitude : NaN
                    longitude: waypoint && waypoint.position ? waypoint.position.longitude : NaN
                    altitude: waypoint && waypoint.position ? waypoint.position.altitude : NaN
                    onChanged: controller.setPosition(latitude, longitude, altitude)
                }

                ParametersEdit {
                    id: parametersEdit
                    parameters: controller.typeParameters(waypoint.type)
                    parameterValues: controller.waypointParameters
                    onParameterChanged: controller.setWaypointParameter(id, value)
                    Layout.fillWidth: true
                }
            }
        }
    }
}
