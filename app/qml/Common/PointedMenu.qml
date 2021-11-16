import QtQuick 2.6
import Industrial.Controls 1.0 as Controls

Item {
    id: root

    property real invokeX: 0
    property real invokeY: 0

    function addMenu(submenu) { menu.addMenu(submenu); }
    function removeMenu(submenu) { menu.removeMenu(submenu); }

    property alias menuVisible: menu.visible
    property alias title: menu.title
    default property alias contentData: menu.contentData

    function open(x, y) {
        invokeX = x;
        invokeY = y;

        if (menu.count) {
            menu.visible = true;
            menu.popup(invokeX - menu.width / 2, invokeY - menu.height - pointer.height);
        }
    }

    Controls.Menu {
        id: menu
        border.width: 0
    }

    Pointer {
        id: pointer
        x: menu.x + menu.width / 2 - width / 2
        y: menu.y + menu.height
        visible: menu.visible
    }
}
