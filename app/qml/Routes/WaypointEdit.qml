import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Controls.Popup {
    id: root

    property var waypoint
    property int waypointIndex: -1

    onWaypointChanged: if (!waypoint.id) close()

    width: Controls.Theme.baseSize * 11

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: 1

            Controls.Button {
                enabled: waypointIndex > 0
                visible: waypointIndex !== -1
                flat: true
                rightCropped: true
                iconSource: "qrc:/icons/left.svg"
                tipText: qsTr("Previous waypoint")
                onClicked: controller.setWaypointIndex(waypointIndex - 1)
            }

            Controls.Button {
                enabled: waypoint
                flat: true
                leftCropped: true
                rightCropped: true
                text: waypoint ? (waypoint.name + " " + (waypointIndex + 1)) : "-"
                tipText: qsTr("Center on map")
                onClicked: centerWaypoint(waypoint.route, waypointIndex)
                Layout.fillWidth: true
            }

            Controls.Button {
                enabled: waypointIndex < controller.waypointsCount - 1
                visible: waypointIndex !== -1
                flat: true
                leftCropped: true
                iconSource: "qrc:/icons/right.svg"
                tipText: qsTr("Next waypoint")
                onClicked: controller.setWaypointIndex(waypointIndex + 1)
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
