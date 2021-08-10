import QtQuick 2.6
import Industrial.Controls 1.0 as Controls
import QtQuick.Layouts 1.12

RowLayout {
    id: stateItem

    property alias callsign: callsignLabel.text
    property alias originCountry: originlabel.text

    Controls.Label {
        id: callsignLabel
        font.pixelSize: Controls.Theme.auxFontSize
        Layout.fillWidth: true
    }

    Controls.Label {
        id: originlabel
        font.pixelSize: Controls.Theme.auxFontSize
    }
}
