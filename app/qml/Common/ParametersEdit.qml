import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var parameters: []

    property bool flat: true
    property int labelWidth: Controls.Theme.baseSize * 5

    signal parameterChanged(string id, var value)

    implicitWidth: grid.implicitWidth
    implicitHeight: grid.implicitHeight

    Component {
        id: boolEdit

        Controls.CheckBox {
            flat: root.flat
            checked: parameter.value
            onClicked: root.parameterChanged(parameter.id, checked)
        }
    }

    Component {
        id: intEdit

        Controls.SpinBox {
            id: intBox
            flat: root.flat
            from: parameter.minValue ? parameter.minValue : 0
            to: parameter.maxValue ? parameter.maxValue : Number.MAX_VALUE
            stepSize: parameter.step ? parameter.step : 1
            Binding on value {
                when: !intBox.activeFocus
                value: parameter.value ? parameter.value : 0
            }
            onEditingFinished: root.parameterChanged(parameter.id, value)
        }
    }

    Component {
        id: realEdit

        Controls.RealSpinBox { // TODO: works bad
            id: realBox
            flat: root.flat
            realFrom: parameter.minValue ? parameter.minValue : 0
            realTo: parameter.maxValue ? parameter.maxValue : Number.MAX_VALUE * precision
            stepSize: parameter.step ? parameter.step : 1
            Binding on realValue {
                when: !realBox.activeFocus
                value: parameter.value ? parameter.value : NaN
            }
            onRealValueChanged: if (activeFocus) root.parameterChanged(parameter.id, realValue)
        }
    }

    ColumnLayout {
        id: grid
        anchors.fill: parent
        spacing: 1

        Repeater {
            model: parameters

            RowLayout {
                spacing: 1

                Controls.Label {
                    text: modelData.name
                    Layout.minimumWidth: labelWidth
                }

                Loader {
                    readonly property var parameter: modelData

                    sourceComponent: {
                        switch (parameter.type) {
                        case "Bool": return boolEdit;
                        case "Int": return intEdit;
                        case "Real": return realEdit;
                        }
                        return undefined;
                    }
                    Layout.fillWidth: true
                }

                Controls.Button {
                    flat: root.flat
                    leftCropped: true
                    iconSource: "qrc:/icons/restore.svg"
                    tipText: qsTr("Restore to default")
                    enabled: modelData.defaultValue !== modelData.value
                    onClicked: parameterChanged(modelData.id,
                                                modelData.defaultValue ? modelData.defaultValue : NaN)
                }
            }
        }
    }
}
