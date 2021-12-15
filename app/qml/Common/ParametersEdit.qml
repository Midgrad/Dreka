import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var parameters: []
    property var parameterValues

    property bool flat: true
    property int labelWidth: Controls.Theme.baseSize * 3.5

    signal parameterChanged(string id, var value)

    implicitWidth: grid.implicitWidth
    implicitHeight: grid.implicitHeight

    Component {
        id: boolEdit

        Controls.CheckBox {
            id: checkBox
            flat: root.flat
            Binding on checked { when: !checkBox.activeFocus; value: parameterValue }
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
            Binding on value { when: !intBox.activeFocus; value: parameterValue }
            onValueModified: root.parameterChanged(parameter.id, value)
        }
    }

    Component {
        id: realEdit

        Controls.RealSpinBox { // TODO: works bad
            id: realBox
            flat: root.flat
            from: parameter.minValue ? parameter.minValue : -Number.MAX_VALUE
            to: parameter.maxValue ? parameter.maxValue : Number.MAX_VALUE
            stepSize: parameter.step ? parameter.step : 1
            Binding on value { when: !realBox.activeFocus; value: parameterValue }
            onValueModified: root.parameterChanged(parameter.id, value)
        }
    }

    Component {
        id: latLonEdit

        Controls.CoordSpinBox {
            id: coordBox
            flat: root.flat
            isLongitude: parameter.id === "longitude"
            Binding on value { when: !coordBox.activeFocus; value: parameterValue }
            onValueModified: root.parameterChanged(parameter.id, value)
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
                    readonly property var parameterValue: parameterValues[parameter.id]
                    sourceComponent: {
                        switch (parameter.type) {
                        case "Bool": return boolEdit;
                        case "Int": return intEdit;
                        case "Real": return realEdit;
                        case "LatLon": return latLonEdit;
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
                    enabled: modelData.defaultValue !== parameterValues[modelData.id]
                    onClicked: parameterChanged(modelData.id, modelData.defaultValue)
                }
            }
        }
    }
}
