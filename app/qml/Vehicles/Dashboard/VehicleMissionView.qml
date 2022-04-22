import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka.Vehicles 1.0

Row {
    id: root

    readonly property real availableWidth: width - missionButton.width - wpBox.width - spacing * 2

    property alias vehicleId: vehicleMissionController.vehicleId

    spacing: 1

    VehicleMissionController { id: vehicleMissionController }

    Controls.MenuItem {
        id: navToItem
        enabled: selectedVehicle && selectedVehicle.online
        text: qsTr("Nav to")
        onTriggered: {
            controller.sendCommand("setMode", [ "NavTo" ]); // FIXME: to domain, packed commands
            vehicleMissionController.navTo(mapMenu.latitude, mapMenu.longitude);
        }
    }

    Component.onCompleted: {
        map.registerController("missionRouteController", vehicleMissionController);
        mapMenu.addItem(navToItem);
    }

    Controls.Button {
        id: missionButton
        height: parent.height
        flat: true
        rightCropped: true
        iconSource: "qrc:/icons/route.svg"
        tipText: qsTr("Mission")
        enabled: controller.selectedVehicle !== null
        onClicked: missions.selectMission(vehicleMissionController.mission.id)

        Controls.ColoredIcon {
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            anchors.margins: Controls.Theme.margins * 0.4
            width: parent.width * 0.4
            height: width
            source: ":/icons/ok.svg"
            color: Controls.Theme.colors.positive // TODO: mission status icon
        }
    }

    Controls.ComboBox {
        id: wpBox
        width: root.width / 2.5
        flat: true
        labelText: qsTr("WPT")
        enabled: selectedVehicle && selectedVehicle.online
        model: vehicleMissionController.routeItems
        displayText: vehicleMissionController.routeItems[vehicleMissionController.currentItem]
        Binding on currentIndex {
            value: vehicleMissionController.currentItem
            when: !wpBox.activeFocus
        }
        onActivated: vehicleMissionController.switchItem(index)
    }
}
