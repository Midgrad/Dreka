import QtQuick 2.12
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls

import "List"

Controls.Button {
    id: root

    tipText: highlighted ? qsTr("Close comm links") : qsTr("Open comm links")
    iconSource: "qrc:/icons/connect.svg"
    highlighted: sidebar.sourceComponent == commLinkList
    onClicked: sidebar.sourceComponent = highlighted ? null : commLinkList

    Component {
        id: commLinkList

        CommLinkListView { id: commLinkList }
    }
}
