#include "map_ruler_controller.h"

#include <QDebug>

using namespace md::presentation;

MapRulerController::MapRulerController(QObject* parent) : QObject(parent)
{
}

bool MapRulerController::rulerMode() const
{
    return m_rulerMode;
}

float MapRulerController::distance() const
{
    return m_distance;
}

bool MapRulerController::isEmpty() const
{
    return qFuzzyIsNull(m_distance);
}

void MapRulerController::setRulerMode(bool rulerMode)
{
    if (m_rulerMode == rulerMode)
        return;

    m_rulerMode = rulerMode;
    emit rulerModeChanged(rulerMode);
}

void MapRulerController::setDistance(float distance)
{
    if (qFuzzyCompare(m_distance, distance))
        return;

    m_distance = distance;
    emit distanceChanged(distance);
}

void MapRulerController::clear()
{
    this->setDistance(0);
    emit cleared();
}
