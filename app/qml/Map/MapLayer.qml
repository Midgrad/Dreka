import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

RowLayout {
     id: root

     property alias name: nameLabel.text
     property alias visibility: visibilityBox.checked

     spacing: 0
     implicitHeight: Controls.Theme.baseSize

     Controls.Label {
         id: nameLabel
         font.pixelSize: Controls.Theme.auxFontSize
         Layout.fillWidth: true
     }

     Controls.CheckBox {
         id: visibilityBox
     }
 }
