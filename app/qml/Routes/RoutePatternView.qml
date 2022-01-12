import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Controls.Popup {
    id: root

    property var pattern: controller.pattern

    function selectRoute(routeId) {
        controller.selectRoute(routeId);
    }

    function newPattern(patternId, x, y) {
        controller.createPattern(patternId);
        root.x = x;
        root.y = y;
    }

    width: Controls.Theme.baseSize * 9
    visible: pattern !== undefined
    closePolicy: Controls.Popup.CloseOnEscape

    RoutePatternController { id: controller }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: 1

            Controls.Label {
                text: pattern ? pattern.name : ""
                horizontalAlignment: Text.AlignHCenter
                Layout.fillWidth: true
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: "qrc:/icons/ok.svg"
                tipText: qsTr("Apply")
                enabled: controller.ready
                onClicked: controller.apply()
            }

            Controls.Button {
                flat: true
                leftCropped: true
                iconSource: "qrc:/icons/close.svg"
                tipText: qsTr("Cancel")
                onClicked: controller.cancel()
            }
        }

        ParametersEdit {
            id: parametersEdit
//            parameters: controller.typeParameters(routeItem.type)
//            parameterValues: controller.itemParameters
//            onParameterChanged: controller.setParameter(id, value)
            Layout.fillWidth: true
        }

        Repeater {
            model: controller.coordinates
        }
    }
}
