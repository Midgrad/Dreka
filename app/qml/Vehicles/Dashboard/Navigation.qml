import QtQuick 2.12
import Industrial.Controls 1.0 as Controls
import Industrial.Indicators 1.0 as Indicators

Row {
    id: root

    property bool dms: true

    Controls.ColoredIcon {
        id: snsIcon
        color: {
            if (typeof params.gpsFix === "undefined")
                return Indicators.Theme.disabledColor;

            switch (params.gpsFix) {
            case -1:
            case 0: return Indicators.Theme.extremeRed;
            case 1: return Indicators.Theme.severeOrange;
            case 2: return Indicators.Theme.moderateYellow;
            case 3:
            default: return Indicators.Theme.textColor;
            }
        }
        source: "qrc:/icons/gps.svg"
        height: Controls.Theme.baseSize
        width: height

        Text {
            text: guardNaN(params.satellitesVisible)
            font.pixelSize: parent.height / 4
            font.bold: true
            anchors.bottom: parent.bottom
            anchors.right: parent.right
            color: parent.color
        }
    }

    Item {
        width: root.width - snsIcon.width - switchButton.width - trackButton.width
        implicitHeight: Controls.Theme.baseSize

        Indicators.Text {
            anchors.top: parent.top
            width: parent.width
            font.pixelSize: Indicators.Theme.auxFontSize
            color: params.latitude ? Indicators.Theme.textColor : Indicators.Theme.disabledColor
            text: {
                var result = qsTr("Lat") + ": ";

                if (!params.latitude) {
                    result += "-";
                }
                else {
                    if (dms)
                        result += "  " + Controls.Helper.degreesToDmsString(params.latitude, false, 2);
                    else
                        result += params.latitude.toFixed(7);
                }

                return result;
            }
        }

        Indicators.Text {
            anchors.bottom: parent.bottom
            width: parent.width
            font.pixelSize: Indicators.Theme.auxFontSize
            color: params.longitude ? Indicators.Theme.textColor : Indicators.Theme.disabledColor
            text: {
                var result = qsTr("Lon") + ": ";

                if (!params.longitude) {
                    result += "-";
                }
                else {
                    if (dms)
                        result += Controls.Helper.degreesToDmsString(params.longitude, true, 2);
                    else
                        result += params.longitude.toFixed(7);
                }

                return result;
            }
        }
    }

    Controls.Button {
        id: switchButton
        flat: true
        rightCropped: true
        leftCropped: true
        iconSource: "qrc:/icons/swap.svg"
        tipText: qsTr("Switch coordinates presentation")
        onClicked: dms = !dms
    }

    Controls.Button {
        id: trackButton
        enabled: controller.selectedVehicle !== null
        flat: true
        leftCropped: true
        iconSource: controller.tracking ? "qrc:/icons/cancel_track.svg" : "qrc:/icons/center.svg"
        tipText: controller.tracking ? qsTr("Cancel track") : qsTr("Track")
        onClicked: controller.setTracking(!controller.tracking)
    }
}



