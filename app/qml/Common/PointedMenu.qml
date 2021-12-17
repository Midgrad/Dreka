import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

PointedItem {
    id: root

    function addMenu(submenu) { menu.addMenu(submenu); }
    function removeMenu(submenu) { menu.removeMenu(submenu); }
    function addItem(item) { menu.addItem(item); }
    function removeItem(item) { menu.removeItem(item); }

    property alias menuVisible: menu.visible
    property alias title: menu.title
    default property alias contentData: menu.contentData

    readonly property bool enabledCount: {
        for (var i = 0; i < menu.count; ++i) {
            if (menu.itemAt(i).enabled)
                return true;
        }

        return false;
    }

    function open(x, y) {
        if (enabledCount) {
            menu.open();
            move(x, y);
        }
    }

    pointed: Controls.Menu {
        id: menu
        border.width: 0
        onClosed: root.hidePointer()
    }
}
