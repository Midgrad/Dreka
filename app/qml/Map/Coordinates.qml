import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

RowLayout {
    id: row

    property bool dmsFormat: true
    property real latitude: NaN
    property real longitude: NaN

    spacing: 10

    Text {
        font.bold: true
        font.pixelSize: Controls.Theme.auxFontSize
        color: Controls.Theme.colors.text
        text: {
            var result = qsTr("Lat:") + " ";
            if (isNaN(latitude)) {
                result += "-";
            } else {
                if (dmsFormat)
                    result += Controls.Helper.degreesToDmsString(latitude, false, 2);
                else
                    result += latitude.toFixed(8);
            }
            return result;
        }
        Layout.fillWidth: true
    }

    Text {
        font.bold: true
        font.pixelSize: Controls.Theme.auxFontSize
        color: Controls.Theme.colors.text
        text: {
            var result = qsTr("Lat:") + " ";
            if (isNaN(longitude)) {
                result += "-";
            } else {
                if (dmsFormat)
                    result += Controls.Helper.degreesToDmsString(longitude, true, 2);
                else
                    result += longitude.toFixed(8);
            }
            return result;
        }
        Layout.fillWidth: true
    }

    Controls.Button {
        backgroundOpacity: 0.25
        font.bold: true
        font.pixelSize: Controls.Theme.auxFontSize
        text: dmsFormat ? "DMS" : "X.X"
        onClicked: dmsFormat = !dmsFormat
    }
}
