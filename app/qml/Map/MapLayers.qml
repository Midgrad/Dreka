import QtQuick 2.6
import QtQuick.Layouts 1.12
import Industrial.Controls 1.0 as Controls
import Dreka 1.0

MapButton {
    id: root

    MapLayersController {
        id: layers
    }

    Component.onCompleted: webChannel.registerObject("layersController", layers)

    tipText: qsTr("Map layers")
    iconSource: "../app/icons/layers.svg"
}
