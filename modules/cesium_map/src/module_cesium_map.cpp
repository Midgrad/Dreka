#include "module_cesium_map.h"

#include <QDebug>
#include <QQmlEngine>

#include "clipboard_controller.h"
#include "map_grid_controller.h"
#include "map_layers_controller.h"
#include "map_ruler_controller.h"
#include "map_viewport_controller.h"

using namespace dreka::app;

ModuleCesiumMap::ModuleCesiumMap()
{
    qmlRegisterType<MapViewportController>("Dreka", 1, 0, "MapViewportController");
    qmlRegisterType<MapRulerController>("Dreka", 1, 0, "MapRulerController");
    qmlRegisterType<MapGridController>("Dreka", 1, 0, "MapGridController");
    qmlRegisterType<ClipboardController>("Dreka", 1, 0, "ClipboardController");
    qmlRegisterType<MapLayersController>("Dreka", 1, 0, "MapLayersController");
}

void ModuleCesiumMap::init()
{
}

void ModuleCesiumMap::done()
{
}

QString ModuleCesiumMap::qmlUrl() const
{
    return "qrc:/CesiumMap/CesiumMap.qml";
}
