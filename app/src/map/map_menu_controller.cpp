#include "map_menu_controller.h"

#include <QDebug>

using namespace md::presentation;

MapMenuController::MapMenuController(QObject* parent) : QObject(parent)
{
}

void MapMenuController::invokePosition(int x, int y, double latitude, double longitude,
                                       float altitude)
{
    emit invokedPosition(x, y, latitude, longitude, altitude);
}
