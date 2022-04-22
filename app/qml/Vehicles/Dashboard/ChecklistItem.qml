import QtQuick 2.12
import QtQuick.Layouts 1.3
import Industrial.Controls 1.0 as Controls
import Industrial.Indicators 1.0 as Indicators

RowLayout {
    id: control

    property bool active: true
    property bool inProcess: false
    property bool caution: false
    property bool failed: false

    property alias text: label.text

    Controls.Label {
        id: label
        font.weight: Font.Medium
        font.pixelSize: Controls.Theme.auxFontSize
        Layout.fillWidth: true
        color: active ? Indicators.Theme.textColor : Indicators.Theme.disabledColor
    }

    Controls.ColoredIcon {
        id: icon
        implicitWidth: Controls.Theme.baseSize * 0.8
        implicitHeight: implicitWidth
        color: {
            if (!active) return Indicators.Theme.disabledColor;
            if (inProcess) return Indicators.Theme.activeColor;
            if (failed) return Indicators.Theme.extremeRed;
            if (caution) return Indicators.Theme.moderateYellow;

            return Indicators.Theme.normalGreen;
        }
        source: {
            if (!active) return "qrc:/icons/cancel.svg";
            if (inProcess) return "qrc:/icons/refresh.svg";
            if (failed) return "qrc:/icons/close.svg";
            if (caution) return "qrc:/icons/info.svg";

            return "qrc:/icons/ok.svg";
        }

        MouseArea {
            id: area
            anchors.fill: parent
            hoverEnabled: true
        }

        Controls.ToolTip {
            id: toolTip
            visible: area.containsMouse
            text: {
                if (!active) return qsTr("Unactive");
                if (inProcess) return qsTr("In process");
                if (failed) return qsTr("Failed");
                if (caution) return qsTr("Caution");

                return qsTr("Normal");
            }
        }
    }
}
