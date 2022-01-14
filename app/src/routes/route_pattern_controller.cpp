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

QJsonArray RoutePatternController::positions() const
{
    QJsonArray array;
    for (const Geodetic& coordinate : m_positions)
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

void RoutePatternController::addPosition(const QVariant& position)
{
    m_positions.append(Geodetic(position.toMap()));
    emit positionsChanged();
}

void RoutePatternController::removePosition(int index)
{
    if (index < 0 || index >= m_positions.count())
        return;

    m_positions.removeAt(index);
    emit positionsChanged();
}

void RoutePatternController::cancel()
{
    m_pattern = nullptr;
    m_positions.clear();

    emit patternChanged();
    emit readyChanged();
    emit positionsChanged();
}

void RoutePatternController::apply()
{
}
