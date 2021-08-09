import QtQuick 2.6
import Industrial.Controls 1.0 as Controls
import QtQuick.Layouts 1.12

RowLayout {
    id: stateItem

    property alias callsign: label.text

    Controls.Label {
        id: label
        Layout.fillWidth: true
    }
}
