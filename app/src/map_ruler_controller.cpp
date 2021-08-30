#include "map_ruler_controller.h"

#include <QDebug>

using namespace md::presentation;

MapRulerController::MapRulerController(QObject* parent) : QObject(parent)
{
}

bool MapRulerController::isEmpty() const
{
    return qFuzzyIsNull(distance);
}
