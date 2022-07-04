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
    readonly property bool exist: inRouteIndex != -1

    implicitHeight: properties.height
    contentHeight: properties.implicitHeight
    flickableDirection: Flickable.VerticalFlick
    boundsBehavior: Flickable.StopAtBounds
    clip: true

    Component.onCompleted: missions.selectedRouteItemIndex = Qt.binding(() => { return inRouteIndex; })
    Component.onDestruction: missions.selectedRouteItemIndex = -1

    MissionRouteItemController { id: itemController }

    ColumnLayout {
        id: properties
        width: parent.width
        spacing: 1

        RowLayout {
            spacing: 1

            Controls.Label {
                text: root.exist ? qsTr("Name") : qsTr("New Item")
                Layout.minimumWidth: parametersEdit.labelWidth
                Layout.fillWidth: !root.exist
            }

            Controls.TextField {
                id: nameEdit
                visible: root.exist
                flat: true
                Binding on text {
                    value: routeItem ? routeItem.name : ""
                    when: !nameEdit.activeFocus
                }
                onEditingFinished: itemController.rename(text)
                Layout.fillWidth: true
            }

            Controls.Button {
                enabled: root.exist
                flat: true
                leftCropped: true
                rightCropped: true
                iconSource: "qrc:/icons/center.svg"
                tipText: qsTr("Center")
                onClicked: missionsMapController.centerRouteItem(missionId, inRouteIndex)
            }

            Controls.Button {
                enabled: root.exist && !routeItem.current
                flat: true
                leftCropped: true
                rightCropped: true
                highlightColor: Controls.Theme.colors.negative
                iconSource: "qrc:/icons/remove.svg"
                tipText: qsTr("Remove")
                onClicked: itemController.remove()
            }

            Controls.MenuButton {
                id: addButton
                flat: true
                leftCropped: true
                iconSource: "qrc:/icons/plus.svg"
                tipText: qsTr("Add route item")
                model: itemController.itemTypes(inRouteIndex + 1)
                delegate: Controls.MenuItem {
                    text: modelData.shortName
                    // TODO: type icons iconSource: "qrc:/icons/" + modelData.icon
                    onTriggered: {
                        addButton.close();
                        itemController.addNewItem(modelData.id, map.centerPosition);
                    }
                }
            }
        }

        RowLayout {
            spacing: 1
            visible: root.exist

            Controls.Label {
                text: qsTr("Type")
                Layout.minimumWidth: parametersEdit.labelWidth
            }

            Controls.ComboBox {
                id: itemTypeBox
                flat: true
                model: itemController.itemTypes(inRouteIndex)
                textRole: "name"
                currentIndex: {
                    if (!routeItem)
                        return -1;

                    for (var i = 0; i < model.length; ++i) {
                        if (routeItem.type === model[i].id)
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
            visible: root.exist
            position: routeItem ? routeItem.position : null
            onModified: itemController.setPosition(position)
        }

        ParametersEdit {
            id: parametersEdit
            visible: root.exist
            parameters: itemController.typeParameters
            parameterValues: itemController.itemParameters
            onParameterChanged: itemController.setParameter(id, value)
            Layout.fillWidth: true
        }
    }
}
