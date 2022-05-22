import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka.Missions 1.0

import "../../Common"

Flickable {
    id: root

    property alias missionId: itemController.missionId
    property alias inRouteIndex: itemController.inRouteIndex

    readonly property alias routeItem: itemController.routeItem

    implicitHeight: properties.height
    contentHeight: properties.implicitHeight
    flickableDirection: Flickable.VerticalFlick
    boundsBehavior: Flickable.StopAtBounds
    clip: true

    MissionRouteItemController { id: itemController }

    ColumnLayout {
        id: properties
        width: parent.width
        spacing: 1

        RowLayout {
            spacing: 1

            Controls.Label {
                text: qsTr("Name")
                Layout.minimumWidth: parametersEdit.labelWidth
            }

            Controls.TextField {
                id: nameEdit
                flat: true
                Binding on text {
                    value: routeItem ? routeItem.name : qsTr("New Item")
                    when: !nameEdit.activeFocus
                }
                onEditingFinished: itemController.rename(text)
                Layout.fillWidth: true
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: "qrc:/icons/center.svg"
                tipText: qsTr("Center")
                onClicked: missionsMapController.centerMissionItem(missionId, inRouteIndex)
            }

            Controls.Button {
                flat: true
                leftCropped: true
                rightCropped: true
                highlightColor: Controls.Theme.colors.negative
                enabled: !routeItem.current
                iconSource: "qrc:/icons/remove.svg"
                tipText: qsTr("Remove")
                onClicked: itemController.remove()
            }

            Controls.MenuButton {
                flat: true
                leftCropped: true
                iconSource: "qrc:/icons/plus.svg"
                tipText: qsTr("Add route item")
                model: itemController.itemTypes
                delegate: Controls.MenuItem {
                    text: modelData.shortName
                    // TODO: type icons iconSource: "qrc:/icons/" + modelData.icon
                    onTriggered: itemController.addNewItem(modelData.id, map.centerPosition)
                }
            }
        }

        RowLayout {
            spacing: 1
            visible: inRouteIndex != -1

            Controls.Label {
                text: qsTr("Type")
                Layout.minimumWidth: parametersEdit.labelWidth
            }

            Controls.ComboBox {
                id: itemTypeBox
                flat: true
                model: itemController.itemTypes
                textRole: "name"
                currentIndex: {
                    if (!routeItem)
                        return -1;

                    var types = itemController.itemTypes;
                    for (var i = 0; i < types.length; ++i) {
                        if (routeItem.type === types[i].id)
                            return i;
                    }
                    return -1;
                }
                onActivated: itemController.changeItemType(currentItem.id);
                Layout.fillWidth: true
            }
        }

        PositionEdit {
            id: positionEdit
            visible: inRouteIndex != -1
            position: routeItem ? routeItem.position : null
            onModified: itemController.setPosition(position)
        }

        ParametersEdit {
            id: parametersEdit
            visible: inRouteIndex != -1
            parameters: itemController.typeParameters
            parameterValues: itemController.itemParameters
            onParameterChanged: itemController.setParameter(id, value)
            Layout.fillWidth: true
        }
    }
}
