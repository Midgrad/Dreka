import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka.CommLinks 1.0

Controls.Pane {
    id: root

    signal selectLink(var commLink)

    width: Controls.Theme.baseSize * 13

    CommLinkListController { id: controller }

    ColumnLayout {
        anchors.fill: parent
        spacing: Controls.Theme.spacing

        RowLayout {
            spacing: Controls.Theme.spacing

            Controls.FilterField {
                id: filterField
                flat: true
                placeholderText: qsTr("Filter comm links")
                Layout.fillWidth: true
            }

            Controls.MenuButton {
                flat: true
                iconSource: "qrc:/icons/plus.svg"
                model: controller.commLinkTypes
                delegate: Controls.MenuItem {
                    text: modelData.name
                    onTriggered: controller.addCommLink(modelData.id);
                }
            }
        }

        Widgets.ListWrapper {
            emptyText: qsTr("No comm links")
            model: controller.commLinks
            delegate: CommLink {
                width: parent.width
                height: visible ? implicitHeight : 0
                visible: commLink && commLink.name.indexOf(filterField.text) > -1
                commLink: modelData
                onExpand: root.selectLink(commLink)
            }
            Layout.fillWidth: true
            Layout.fillHeight: true
        }
    }
}
