import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Row {
    id: root

    readonly property real availableWidth: width - missionButton.width - wpBox.width - spacing * 2

    spacing: 1

    MissionController {
        id: missionController
        vehicleId: controller.selectedVehicle
        onMissionChanged: routes.setActiveMission(mission.id)
    }

    Controls.Button {
        id: missionButton
        height: parent.height
        flat: true
        rightCropped: true
        iconSource: "qrc:/icons/route.svg"
        tipText: qsTr("Mission")
        highlighted: missionPopup.visible
        enabled: controller.selectedVehicle !== undefined
        onClicked: missionPopup.visible ? missionPopup.close() : missionPopup.open()

        MissionPopup {
            id: missionPopup
            x: -width - Controls.Theme.margins - Controls.Theme.spacing
            y: parent.y - height + parent.height
            closePolicy: Controls.Popup.CloseOnPressOutsideParent
        }
    }

    Controls.ComboBox {
        id: wpBox
        width: root.width / 2
        flat: true
        labelText: qsTr("WPT")
        enabled: controller.selectedVehicle !== undefined
        model: missionController.items
        displayText: missionController.items[missionController.currentItem]
        Binding on currentIndex {
            value: missionController.currentItem
            when: !wpBox.activeFocus
        }
        onActivated: missionController.switchItem(index)
    }
}
