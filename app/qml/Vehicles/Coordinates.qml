import QtQuick 2.6
import Industrial.Controls 1.0 as Controls
import Industrial.Indicators 1.0 as Indicators

Item {
    id: root

    property bool dms: true

    implicitHeight: Controls.Theme.baseSize

    Indicators.Text {
        anchors.top: parent.top
        width: parent.width
        horizontalAlignment: Text.AlignRight
        font.pixelSize: Indicators.Theme.auxFontSize
        color: params.latitude ? Indicators.Theme.textColor : Indicators.Theme.disabledColor
        text: {
            var result = qsTr("Lat") + ":";

            if (!params.latitude) {
                result += "-";
            }
            else {
                if (dms)
                    result += Controls.Helper.degreesToDmsString(params.latitude, false, 2);
                else
                    result += params.latitude.toFixed(7);
            }

            return result;
        }
    }

    Indicators.Text {
        anchors.bottom: parent.bottom
        width: parent.width
        horizontalAlignment: Text.AlignRight
        font.pixelSize: Indicators.Theme.auxFontSize
        color: params.longitude ? Indicators.Theme.textColor : Indicators.Theme.disabledColor
        text: {
            var result = qsTr("Lon") + ":";

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

