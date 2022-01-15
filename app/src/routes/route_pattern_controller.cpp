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
    if (!m_pattern)
        return QJsonArray();

    QJsonArray array;
    for (const Geodetic& coordinate : m_pattern->areaPositions())
    {
        array += QJsonObject::fromVariantMap(coordinate.toVariantMap());
    }

    return array;
}

QJsonArray RoutePatternController::pathPositions() const
{
    if (!m_pattern)
        return QJsonArray();

    QJsonArray array;
    for (const Geodetic& coordinate : m_pattern->pathPositions())
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

void RoutePatternController::createPattern(const QString& patternTypeId)
{
    if (!m_route)
        return;

    if (m_pattern)
        this->cancel();

    m_pattern = m_routesService->createRoutePattern(patternTypeId);

    if (m_pattern)
    {
        connect(m_pattern, &RoutePattern::pathPositionsChanged, this,
                &RoutePatternController::pathPositionsChanged);
        connect(m_pattern, &RoutePattern::areaPositionsChanged, this,
                &RoutePatternController::areaPositionsChanged);
    }
    emit patternChanged();
}

void RoutePatternController::setAreaPositions(const QVariantList& positions)
{
    if (!m_pattern)
        return;

    QVector<Geodetic> areaPositions;
    for (const QVariant& position : positions)
    {
        areaPositions.append(Geodetic(position.toMap()));
    }
    m_pattern->setAreaPositions(areaPositions);
}

void RoutePatternController::cancel()
{
    if (m_pattern)
    {
        m_pattern->deleteLater();
        m_pattern = nullptr;
    }

    emit patternChanged();
    emit readyChanged();
    emit areaPositionsChanged();
    emit pathPositionsChanged();
}

void RoutePatternController::apply()
{
}
