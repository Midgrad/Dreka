import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

GridLayout {
    id: root

    property bool flat: true
    property int labelWidth: Controls.Theme.baseSize * 3.5
    property bool dms: true

    property var position: { "datum": "", "latitude": 0.0, "longitude": 0.0, "altitude": 0.0 }

    signal modified(var position)

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
        Layout.preferredWidth: labelWidth
    }

    Controls.CoordSpinBox {
        id: latCsb
        visible: dms
        flat: root.flat
        table: true
        isLongitude: false
        Binding on value { value: position ? position.latitude : 0; when: !latCsb.activeFocus }
        onValueModified: {
            position.latitude = value;
            root.modified(position);
        }
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
        Binding on value { value: position ? position.latitude : 0; when: !latSb.activeFocus }
        onValueModified: {
            position.latitude = value;
            root.modified(position);
        }
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
        Layout.preferredWidth: labelWidth
    }

    Controls.CoordSpinBox {
        id: lonCsb
        visible: dms
        flat: root.flat
        table: true
        isLongitude: true
        Binding on value { value: position ? position.longitude : 0; when: !lonCsb.activeFocus }
        onValueModified: {
            position.longitude = value;
            root.modified(position);
        }
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
        Binding on value { value: position ? position.longitude : 0; when: !lonSb.activeFocus }
        onValueModified: {
            position.longitude = value;
            root.modified(position);
        }
        Layout.fillWidth: true
    }

    Controls.Label {
        text: qsTr("Alt. MSL, m")
        Layout.preferredWidth: labelWidth
    }

    Controls.RealSpinBox {
        id: altSb
        flat: root.flat
        table: true
        from: -500
        to: 100000
        Binding on value { value: position ? position.altitude : 0; when: !altSb.activeFocus }
        onValueModified: {
            position.altitude = value;
            root.modified(position);
        }
        Layout.fillWidth: true
        Layout.columnSpan: 2
    }
}
