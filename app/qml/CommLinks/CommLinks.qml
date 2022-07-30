import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

import "List"
import "Edit"

RowLayout {
    id: root

    property var selectedLink: null

    onSelectedLinkChanged: {
        if (selectedLink && sidebar.sourceComponent == linkListComponent) {
            sidebar.sourceComponent = linkEditComponent;
        }
        else if (!selectedLink && sidebar.sourceComponent == linkEditComponent) {
            sidebar.sourceComponent = linkListComponent;
        }
    }

    spacing: 1

    Controls.Button {
        visible: !selectedLink
        tipText: highlighted ? qsTr("Close comm links list") : qsTr("Open comm link list")
        iconSource: "qrc:/icons/connect.svg"
        highlighted: sidebar.sourceComponent == linkListComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : linkListComponent
    }

    Controls.Button {
        rightCropped: true
        visible: selectedLink
        iconSource: "qrc:/icons/left.svg"
        tipText: qsTr("Return to list")
        onClicked: selectedLink = null
    }

    Controls.Button {
        leftCropped: true
        visible: selectedLink
        text: selectedLink ? selectedLink.name : ""
        tipText: highlighted ? qsTr("Close link editor") : qsTr("Open link editor")
        highlighted: sidebar.sourceComponent == linkEditComponent
        onClicked: sidebar.sourceComponent = highlighted ? null : linkEditComponent
    }

    Component {
        id: linkListComponent

        CommLinkListView { onSelectLink: root.selectedLink = commLink }
    }

    Component {
        id: linkEditComponent

        CommLinkEditView {
            selectedLinkId: root.selectedLink.id
            Component.onDestruction: root.selectedLink = null
        }
    }
}
