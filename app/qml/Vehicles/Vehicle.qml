import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property var vehicle
    readonly property bool selected: controller.selectedVehicle === vehicle.id

    signal expand()

    Connections {
        target: controller
        onVehicleChanged: if (vehicleId === root.vehicle.id) root.vehicle = vehicle
    }

    implicitWidth: row.implicitWidth
    implicitHeight: Controls.Theme.baseSize * 1.5

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        onClicked: if (!selected) expand()
    }

    Rectangle {
        anchors.fill: parent
        opacity: 0.20
        color: {
            if (selected)
                return Controls.Theme.colors.description;
            return mouseArea.containsMouse ? Controls.Theme.colors.highlight : "transparent"
        }
        radius: Controls.Theme.rounding
    }

    RowLayout {
        id: row
        anchors.fill: parent
        anchors.leftMargin: Controls.Theme.margins
        spacing: Controls.Theme.spacing

        ColumnLayout {
            spacing: 1

            Controls.Label {
                text: vehicle ? vehicle.name : ""
                Layout.alignment: Qt.AlignVCenter
            }

            Controls.Label {
                text: vehicle ? vehicle.type : ""
                type: Controls.Theme.Label
                Layout.alignment: Qt.AlignVCenter
            }
        }

        Item { Layout.fillWidth: true }

        Controls.Led {
            color: vehicle.online ? Controls.Theme.colors.positive : Controls.Theme.colors.disabled
            Layout.rightMargin: Controls.Theme.margins
        }

        Controls.Button {
            flat: true
            leftCropped: true
            rightCropped: true
            highlightColor: Controls.Theme.colors.negative
            hoverColor: highlightColor
            iconSource: "qrc:/icons/remove.svg"
            enabled: !vehicle.online
            tipText: qsTr("Remove")
            onClicked: controller.removeVehicle(vehicle.id)
        }

        Controls.ColoredIcon {
            implicitWidth: Controls.Theme.iconSize
            implicitHeight: width
            color: selected ? Controls.Theme.colors.disabled : Controls.Theme.colors.text
            source: "qrc:/icons/right.svg"
            Layout.alignment: Qt.AlignVCenter
            Layout.rightMargin: Controls.Theme.padding
        }
    }
}
