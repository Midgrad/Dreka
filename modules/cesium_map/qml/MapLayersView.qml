import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Industrial.Widgets 1.0 as Widgets
import Dreka 1.0

MapButton {
    id: root

    MapLayersController { id: layers }

    Component.onCompleted: webChannel.registerObject("layersController", layers)
    Component.onDestruction: layers.save()

    tipText: qsTr("Map layers")
    iconSource: "qrc:/icons/layers.svg"
    highlighted: popup.visible
    onClicked: popup.visible ? popup.close() : popup.open()

    Controls.ButtonGroup { id: visibilityGroup }

    Controls.Popup {
        id: popup

        closePolicy: Controls.Popup.NoAutoClose
        width: Controls.Theme.baseSize * 10
        y: -height - Controls.Theme.spacing
        x: root.width - width
        backgroundOpacity: 0.45
        backgroundColor: "black"

        Widgets.ListWrapper {
            model: layers.layers
            anchors.fill: parent
            emptyText: qsTr("No layers")

            delegate: MapLayer {
                width: parent.width
                name: modelData.name
                visibility: modelData.visibility
                onVisibilityToggled: if (visibility) layers.toggleVisibility(name)
            }
        }
    }
}
