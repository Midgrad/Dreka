import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

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
                onActivated: controller.changeWaypointType(currentItem.id);
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
                spacing: Controls.Theme.spacing

                PositionEdit {
                    datum: waypoint.datum ? waypoint.datum : ""
                    latitude: waypoint.latitude ? waypoint.latitude : NaN
                    longitude: waypoint.longitude ? waypoint.longitude : NaN
                    altitude: waypoint.altitude ? waypoint.altitude : NaN
                    onChanged: controller.setWaypointPosition(latitude, longitude, altitude)
                    Layout.fillWidth: true
                }

                ParametersEdit {
                    parameters: controller.waypointParameters
                    onParameterChanged: controller.setWaypointParameter(id, value)
                    Layout.fillWidth: true
                }
            }

            Controls.ScrollBar.vertical: Controls.ScrollBar {
                visible: properties.height > root.height
            }
        }
    }
}
