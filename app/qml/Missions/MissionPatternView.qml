import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

import "../Common"

Controls.Popup {
    id: root

    property var pattern: controller.pattern

    function selectMission(routeId) {
        controller.selectMission(routeId);
    }

    function newPattern(patternId, x, y, position) {
        controller.createPattern(patternId);
        controller.setAreaPositions([position]);
        root.x = Math.max(Controls.Theme.margins, x - width - Controls.Theme.margins);
        root.y = Math.max(Controls.Theme.margins, y);
    }

    width: Controls.Theme.baseSize * 10
    height: column.implicitHeight + padding * 2
    visible: pattern !== undefined
    closePolicy: Controls.Popup.CloseOnEscape

    MissionPatternController { id: controller }

    Component.onCompleted: { map.registerController("routePatternController", controller); }

    Dragger {
        target: root
        anchors.margins: -root.padding
    }

    ColumnLayout {
        id: column
        anchors.centerIn: parent
        width: root.width - root.padding
        height: root.height - root.padding
        spacing: 1

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
            parameters: controller.parameters
            parameterValues: controller.parameterValues
            onParameterChanged: controller.setParameter(id, value)
            Layout.fillWidth: true
        }
    }
}
