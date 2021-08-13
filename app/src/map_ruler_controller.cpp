#include "map_ruler_controller.h"

#include <QDebug>

using namespace dreka::endpoint;

MapRulerController::MapRulerController(QObject* parent) : QObject(parent)
{
}

bool MapRulerController::isEmpty() const
{
    return qFuzzyIsNull(distance);
}
