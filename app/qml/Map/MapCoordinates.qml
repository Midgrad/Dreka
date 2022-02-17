import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

RowLayout {
    id: row

    property bool dmsFormat: true
    property real latitude: NaN
    property real longitude: NaN
    property bool valid: !isNaN(latitude) && !isNaN(longitude)

    spacing: 1

    MapButton {
        leftCropped: true
        rightCropped: true
        tipText: qsTr("Copy coordinates")
        text: {
            var lat = qsTr("Lat:") + " ";
            var lon = qsTr("Lon:") + " ";
            if (!valid) {
                lat += qsTr("invalid");
                lon += qsTr("invalid");
            } else {
                if (dmsFormat) {
                    lat += Controls.Helper.degreesToDmsString(latitude, false, 2);
                    lon += Controls.Helper.degreesToDmsString(longitude, true, 2);
                } else {
                    lat += latitude.toFixed(8);
                    lon += longitude.toFixed(8);
                }
            }
            return lat + " " + lon;
        }
        onClicked: clipboard.setText(text)
        Layout.fillWidth: true
        Layout.minimumWidth: Controls.Theme.baseSize * 8
    }

    MapButton {
        leftCropped: true
        tipText: qsTr("Change format")
        text: dmsFormat ? "DMS" : "X.X"
        onClicked: dmsFormat = !dmsFormat
    }
}
