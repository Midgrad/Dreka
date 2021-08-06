#include "cesium_map.h"

#include <QDebug>
#include <QQmlEngine>

#include "clipboard_controller.h"
#include "map_grid_controller.h"
#include "map_layers_controller.h"
#include "map_ruler_controller.h"
#include "map_viewport_controller.h"

using namespace dreka::app;

CesiumMap::CesiumMap()
{
    qmlRegisterType<MapViewportController>("Dreka", 1, 0, "MapViewportController");
    qmlRegisterType<MapRulerController>("Dreka", 1, 0, "MapRulerController");
    qmlRegisterType<MapGridController>("Dreka", 1, 0, "MapGridController");
    qmlRegisterType<ClipboardController>("Dreka", 1, 0, "ClipboardController");
    qmlRegisterType<MapLayersController>("Dreka", 1, 0, "MapLayersController");
}

void CesiumMap::init()
{
}

void CesiumMap::done()
{
}

QStringList CesiumMap::qmlUrls() const
{
    return { "qrc:/CesiumMap/CesiumMap.qml" };
}
