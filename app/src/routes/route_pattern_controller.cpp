#include "route_pattern_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RoutePatternController::RoutePatternController(QObject* parent) :
    QObject(parent),
    m_routesService(md::app::Locator::get<IRoutesService>())
{
    Q_ASSERT(m_routesService);
}

QVariant RoutePatternController::routeId() const
{
    return m_route ? m_route->id() : QVariant();
}

QVariant RoutePatternController::pattern() const
{
    return m_pattern ? m_pattern->toVariantMap() : QVariant();
}

QJsonArray RoutePatternController::areaPositions() const
{
    QJsonArray array;
    for (const Geodetic& coordinate : m_areaPositions)
    {
        array += QJsonObject::fromVariantMap(coordinate.toVariantMap());
    }

    return array;
}

QJsonArray RoutePatternController::pathPositions() const
{
    QJsonArray array;
    for (const Geodetic& coordinate : m_pathPositions)
    {
        array += QJsonObject::fromVariantMap(coordinate.toVariantMap());
    }

    return array;
}

bool RoutePatternController::ready() const
{
    return false;
}

void RoutePatternController::selectRoute(const QVariant& routeId)
{
    if (this->routeId() == routeId)
        return;

    m_route = m_routesService->route(routeId);
    emit routeChanged();

    if (m_pattern)
        this->cancel();
}

void RoutePatternController::createPattern(const QString& patternId)
{
    if (!m_route)
        return;

    if (m_pattern)
        this->cancel();

    m_pattern = m_route->type()->pattern(patternId);
    emit patternChanged();
}

void RoutePatternController::setAreaPositions(const QVariantList& positions)
{
    m_areaPositions.clear();
    for (const QVariant& position : positions)
    {
        m_areaPositions.append(Geodetic(position.toMap()));
    }
    emit areaPositionsChanged();

    // TODO: ivnoke pattern algoritm here
    QList<domain::Geodetic> tmp = m_areaPositions;
    m_pathPositions.clear();
    while (!tmp.isEmpty())
        m_pathPositions.append(tmp.takeAt(qrand() % tmp.length()));
    emit pathPositionsChanged();
}

void RoutePatternController::cancel()
{
    m_pattern = nullptr;
    m_areaPositions.clear();

    emit patternChanged();
    emit readyChanged();
    emit areaPositionsChanged();
    emit pathPositionsChanged();
}

void RoutePatternController::apply()
{
}
