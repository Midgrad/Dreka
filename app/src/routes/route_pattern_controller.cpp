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

QJsonObject RoutePatternController::patternParameters() const
{
    if (!m_pattern)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_pattern->parameters());
}

QJsonArray RoutePatternController::areaPositions() const
{
    if (!m_pattern)
        return QJsonArray();

    return QJsonArray::fromVariantList(m_pattern->area().toVariantList());
}

QJsonArray RoutePatternController::pathPositions() const
{
    if (!m_pattern)
        return QJsonArray();

    return QJsonArray::fromVariantList(m_pattern->path().toVariantList());
}

bool RoutePatternController::ready() const
{
    return false;
}

QJsonArray RoutePatternController::typeParameters(const QString& typeId)
{
    if (!m_pattern)
        return QJsonArray();

    QJsonArray jsons;
    for (auto parameter : m_pattern->type()->parameters.values())
    {
        jsons.append(QJsonObject::fromVariantMap(parameter->toVariantMap()));
    }

    return jsons;
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

        if (m_route->count())
        {
            // Take initial altitude from entry point
            Geodetic entryPoint = m_route->item(m_route->count() - 1)->position;
            if (m_pattern->hasParameter(route::altitude.id))
                m_pattern->setParameter(route::altitude.id, entryPoint.altitude());
        }
    }
    emit patternChanged();
}

void RoutePatternController::setParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_pattern)
        return;

    m_pattern->setParameter(parameterId, value);
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
    m_pattern->setArea(areaPositions);
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
