import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

import "../Common"

ColumnLayout {
    id: root

    property var payload
    property int payloadIndex: -1

    spacing: 1

    RowLayout {
        spacing: Controls.Theme.spacing

        Controls.Label {
            text: payload ? (payload.name + " " + (payloadIndex + 1)) : "-"
            Layout.fillWidth: true
        }

        Controls.Button {
            flat: true
            leftCropped: true
            hoverColor: Controls.Theme.colors.negative
            iconSource: "qrc:/icons/remove.svg"
            tipText: qsTr("Remove")
            onClicked: controller.removeWaypointItem(payloadIndex)
        }
    }

    ParametersEdit {
        id: parametersEdit
        parameters: controller.waypointItemParameters(payloadIndex)
        onParameterChanged: controller.setWaypointItemParameter(payloadIndex, id, value)
        Layout.fillWidth: true
        Layout.leftMargin: Controls.Theme.margins
    }
}
