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

    signal changed()

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
        Binding on value { when: !latCsb.activeFocus; value: latitude }
        onValueModified: { latitude = value; root.changed() }
        Layout.fillWidth: true
    }

    Controls.RealSpinBox {
        id: latSb
        visible: !dms
        flat: root.flat
        table: true
        realFrom: -90
        realTo: 90
        precision: 0.000001
        Binding on realValue { when: !latSb.activeFocus; value: latitude }
        onRealValueChanged: if (activeFocus) { latitude = realValue; root.changed() }
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
        Binding on value { when: !lonCsb.activeFocus; value: longitude }
        onValueModified: { longitude = value; root.changed() }
        Layout.fillWidth: true
    }

    Controls.RealSpinBox {
        id: lonSb
        visible: !dms
        flat: root.flat
        table: true
        realFrom: -180
        realTo: 180
        precision: 0.000001
        Binding on realValue { when: !lonSb.activeFocus; value: longitude }
        onRealValueChanged: if (activeFocus) { longitude = realValue; root.changed() }
        Layout.fillWidth: true
    }

    Controls.Label {
        text: qsTr("Altitude")
        Layout.fillWidth: true
    }

    Controls.RealSpinBox {
        id: altSb
        flat: root.flat
        table: true
        realFrom: -500
        realTo: 100000
        Binding on realValue { when: !altSb.activeFocus; value: altitude }
        onRealValueChanged: if (activeFocus) { altitude = realValue; root.changed() }
        Layout.fillWidth: true
        Layout.columnSpan: 2
    }
}
