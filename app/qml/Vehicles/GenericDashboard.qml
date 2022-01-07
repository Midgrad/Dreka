import QtQuick 2.6
import Industrial.Controls 1.0 as Controls
import Industrial.Indicators 1.0 as Indicators
import Dreka 1.0

import "../Missions"

Column {
    id: root

    property var params: []
    property bool online: controller.vehicle(controller.selectedVehicle).online

    property Component preflight: Preflight {}

    Connections {
        target: controller
        onSelectedVehicleChanged: params = controller.vehicleData(controller.selectedVehicle)
        onVehicleDataChanged: if (vehicleId === controller.selectedVehicle) params = data
        onVehicleChanged: if (vehicleId === controller.selectedVehicle) online = vehicle.online
    }

    function guardNaN(value) { return value ? value : NaN; }
    function guardBool(value) { return typeof value !== "undefined" && value; }

    spacing: Controls.Theme.spacing
    width: Controls.Theme.baseSize * 8

    Row {
        visible: maximized

        Controls.Button {
            flat: true
            rightCropped: true
            iconSource: "qrc:/icons/calibrate.svg"
            enabled: controller.selectedVehicle !== null
            tipText: qsTr("Preparation")
            highlighted: preflightPopup.visible
            onClicked: preflightPopup.visible ? preflightPopup.close() : preflightPopup.open()

            Controls.Popup {
                id: preflightPopup
                x: -width - Controls.Theme.margins - Controls.Theme.spacing
                closePolicy: Controls.Popup.CloseOnPressOutsideParent

                Loader {
                    anchors.fill: parent
                    sourceComponent: preflight
                }
            }
        }

        Indicators.Text {
            anchors.verticalCenter: parent.verticalCenter
            width: (root.width - Controls.Theme.baseSize) / 2
            color: params.state ? Indicators.Theme.textColor : Indicators.Theme.disabledColor
            text: params.state ? params.state : "-"
        }

        Indicators.Text {
            anchors.verticalCenter: parent.verticalCenter
            width: (root.width - Controls.Theme.baseSize) / 2
            color: params.armed ? Indicators.Theme.textColor : Indicators.Theme.disabledColor
            text: params.armed ? qsTr("ARMED") : qsTr("DISARMED")
        }
    }

    Navigation {
        width: root.width
        visible: maximized
    }

    Row {
        visible: maximized
        spacing: 0

        Column {
            width: root.width / 3.75
            anchors.verticalCenter: parent.verticalCenter
            spacing: Controls.Theme.spacing

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("GS")
                tipText: qsTr("Ground speed")
                value: guardNaN(params.gs)
            }

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("AS")
                tipText: qsTr("Indicated air speed")
                value: guardNaN(params.ias)
            }

            Indicators.Text {
                width: parent.width
                font.pixelSize: Indicators.Theme.auxFontSize
                text: qsTr("m/s")
            }
        }

        Indicators.AttitudeIndicator {
            id: ai
            width: root.width / 2.15
            height: width * 1.35
            markWidth: 2
            markFactor: 0.8
            zigzag: 7
            online: root.online
            ready: guardBool(params.armed)
            pitch: guardNaN(params.pitch)
            roll: guardNaN(params.roll)

            Indicators.ValueLabel {
                anchors.centerIn: parent
                anchors.verticalCenterOffset: -parent.height / 4
                prefixFont.pixelSize: Controls.Theme.auxFontSize * 0.8
                prefix: qsTr("PITCH")
                value: ai.pitch
            }

            Indicators.ValueLabel {
                anchors.centerIn: parent
                anchors.verticalCenterOffset: parent.height / 4
                prefixFont.pixelSize: Controls.Theme.auxFontSize * 0.8
                prefix: qsTr("ROLL")
                value: ai.roll
            }
        }

        Column {
            width: root.width / 3.75
            anchors.verticalCenter: parent.verticalCenter
            spacing: Controls.Theme.spacing

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("AMSL")
                tipText: qsTr("Altitude above main sea level")
                value: guardNaN(params.altitudeAmsl)
            }

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("AREL")
                tipText: qsTr("Altitude relative to HOME position")
                value: guardNaN(params.altitudeRelative)
            }

            Indicators.Text {
                width: parent.width
                font.pixelSize: Indicators.Theme.auxFontSize
                text: qsTr("m")
            }
        }
    }

    Row {
        visible: maximized
        spacing: 0

        Column {
            width: root.width / 4
            anchors.verticalCenter: parent.verticalCenter
            spacing: Controls.Theme.spacing

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("HDG")
                tipText: qsTr("Heading")
                value: compas.heading
            }

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("CRS")
                tipText: qsTr("Course")
                value: compas.course
            }

            Indicators.Text {
                width: parent.width
                font.pixelSize: Indicators.Theme.auxFontSize
                text: "\u00B0"
            }
        }

        Indicators.Compass {
            id: compas
            width: root.width / 2
            tickFactor: 15
            fontSize: height * 0.115
            tickTextedSize: fontSize * 0.3
            textOffset: fontSize * 1.5
            arrowSize: width * 0.2
            mark: "qrc:/icons/generic_aircraft.svg"
            online: root.online
            heading: guardNaN(params.heading)
            course: guardNaN(params.course)
        }

        Column {
            width: root.width / 4
            anchors.verticalCenter: parent.verticalCenter
            spacing: Controls.Theme.spacing

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("WP")
                tipText: qsTr("Waypoint distance")
                value: guardNaN(params.wpDistance)
            }

            Indicators.ValueLabel {
                width: parent.width
                prefix: qsTr("HOME")
                tipText: qsTr("Home distance")
                value: guardNaN(params.homeDistance)
            }

            Indicators.Text {
                width: parent.width
                font.pixelSize: Indicators.Theme.auxFontSize
                text: qsTr("m")
            }
        }
    }

    MissionRouteView {
        id: mission
        width: parent.width
        vehicleId: controller.selectedVehicle

        Controls.ComboBox {
            width: mission.availableWidth
            flat: true
            labelText: qsTr("MODE")
            enabled: online
            model: params.modes ? params.modes : []
            displayText: params.mode ? params.mode : "-"
            onActivated: controller.sendCommand("setMode", [ model[index] ])
        }
    }
}
