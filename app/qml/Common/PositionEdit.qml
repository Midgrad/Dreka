import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

GridLayout {
    id: root

    property bool flat: true
    property bool dms: true

    property string datum: ""
    property real latitude: 0.0
    property real longitude: 0.0
    property real altitude: 0.0

    signal changed(real latitude, real longitude, real altitude)

    onLatitudeChanged: {
        latCsb.value = latitude;
        latSb.value = latitude;
    }

    onLongitudeChanged: {
        lonCsb.value = longitude;
        lonSb.value = longitude;
    }

    onAltitudeChanged: altSb.value = altitude

    rowSpacing: 1
    columnSpacing: 1
    columns: 3

// TODO: datum switch
//    Controls.Label {
//        visible: datum !== ""
//        text: qsTr("Datum")
//        Layout.fillWidth: true
//    }

//    Controls.ComboBox {
//        visible: datum !== ""
//        flat: root.flat
//        table: true
//        displayText: datum
//        Layout.fillWidth: true
//        Layout.columnSpan: 2
//    }

    Controls.Label {
        text: qsTr("Latitude")
        Layout.fillWidth: true
    }

    Controls.CoordSpinBox {
        id: latCsb
        visible: dms
        flat: root.flat
        table: true
        isLongitude: false
        value: latitude
        onValueModified: root.changed(value, longitude, altitude)
        Layout.fillWidth: true
    }

    Controls.RealSpinBox {
        id: latSb
        visible: !dms
        flat: root.flat
        table: true
        from: -90
        to: 90
        precision: 6
        value: latitude
        onValueModified: root.changed(value, longitude, altitude)
        Layout.fillWidth: true
    }

    Controls.Button {
        flat: root.flat
        topCropped: true
        leftCropped: true
        iconSource: "qrc:/icons/swap.svg"
        tipText: qsTr("Switch coordinates presentation")
        onClicked: dms = !dms
        Layout.rowSpan: 2
        Layout.fillHeight: true
    }

    Controls.Label {
        text: qsTr("Longitude")
        Layout.fillWidth: true
    }

    Controls.CoordSpinBox {
        id: lonCsb
        visible: dms
        flat: root.flat
        table: true
        isLongitude: true
        value: longitude
        onValueModified: root.changed(latitude, value, altitude)
        Layout.fillWidth: true
    }

    Controls.RealSpinBox {
        id: lonSb
        visible: !dms
        flat: root.flat
        table: true
        from: -180
        to: 180
        precision: 6
        value: longitude
        onValueModified: root.changed(latitude, value, altitude)
        Layout.fillWidth: true
    }

    Controls.Label {
        text: qsTr("Alt. MSL, m")
        Layout.fillWidth: true
    }

    Controls.RealSpinBox {
        id: altSb
        flat: root.flat
        table: true
        from: -500
        to: 100000
        value: altitude
        onValueModified: root.changed(latitude, longitude, value)
        Layout.fillWidth: true
        Layout.columnSpan: 2
    }
}
