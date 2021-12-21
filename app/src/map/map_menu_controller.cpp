#include "map_menu_controller.h"

#include <QDebug>

using namespace md::presentation;

MapMenuController::MapMenuController(QObject* parent) : QObject(parent)
{
}

void MapMenuController::invoke(int x, int y, double latitude, double longitude, float altitude)
{
    emit invoked(x, y, latitude, longitude, altitude);
}

void MapMenuController::drop()
{
    emit dropped();
}
