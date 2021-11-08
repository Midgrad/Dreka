import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Controls.Popup {
    id: root

    width: Controls.Theme.baseSize * 9

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.Label {
                text: "WPT"
            }
        }
    }
}
