import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

Row {
    id: root

    readonly property real availableWidth: width - missionButton.width - wpBox.width - spacing * 2

    property alias vehicleId : missionRouteController.vehicleId

    spacing: 1

    MissionRouteController { id: missionRouteController }

    Component.onCompleted: map.registerController("missionRouteController", missionRouteController)

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

        MissionOperationView {
            id: missionPopup
            x: -width - Controls.Theme.margins - Controls.Theme.spacing
            y: parent.y - height + parent.height
            closePolicy: Controls.Popup.CloseOnPressOutsideParent
            missionId: missionRouteController.mission.id
        }
    }

    Controls.ComboBox {
        id: wpBox
        width: root.width / 2
        flat: true
        labelText: qsTr("WPT")
        enabled: controller.selectedVehicle !== undefined
        model: missionRouteController.routeItems
        displayText: missionRouteController.routeItems[missionRouteController.currentItem]
        Binding on currentIndex {
            value: missionRouteController.currentItem
            when: !wpBox.activeFocus
        }
        onActivated: missionRouteController.switchItem(index)
    }
}
