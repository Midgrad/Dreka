#include "route_item_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RouteItemController::RouteItemController(QObject* parent) :
    QObject(parent),
    m_routesService(md::app::Locator::get<IRoutesService>())
{
    connect(m_routesService, &IRoutesService::routeRemoved, this, [this](Route* route) {
        if (m_route != route)
            return;

        m_route = nullptr;
        emit routeChanged();
        this->setWaypointIndex(-1);
    });
}

QJsonObject RouteItemController::waypoint() const
{
    if (!m_waypoint)
        return QJsonObject();

    QVariantMap waypoint = m_waypoint->toVariantMap();

    if (m_route)
        waypoint.insert(props::route, m_route->id);

    return QJsonObject::fromVariantMap(waypoint);
}

int RouteItemController::waypointIndex() const
{
    if (!m_route || !m_waypoint)
        return -1;

    return m_route->index(m_waypoint);
}

int RouteItemController::waypointsCount() const
{
    if (!m_route)
        return -1;

    return m_route->count();
}

QJsonArray RouteItemController::waypointTypes() const
{
    if (!m_route)
        return QJsonArray();

    QJsonArray jsons;
    for (auto wptType : m_route->type()->itemTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(wptType->toVariantMap()));
    }
    return jsons;
}

QJsonObject RouteItemController::waypointParameters() const
{
    if (!m_waypoint)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_waypoint->parameters());
}

QJsonArray RouteItemController::typeParameters(const QString& typeId)
{
    if (!m_waypoint)
        return QJsonArray();

    QJsonArray jsons;
    for (auto parameter : m_waypoint->type()->parameters.values())
    {
        jsons.append(QJsonObject::fromVariantMap(parameter->toVariantMap()));
    }

    return jsons;
}

void RouteItemController::invokeWaypointMenu(const QVariant& routeId, int index, double x, double y)
{
    this->setWaypoint(routeId, index);

    if (m_waypoint)
        emit invokeMenu(x, y);
}

void RouteItemController::setWaypoint(const QVariant& routeId, int index)
{
    Route* route = m_routesService->route(routeId);
    if (m_route != route)
    {
        if (m_route)
            disconnect(m_route, nullptr, this, nullptr);

        m_route = route;

        if (m_route)
        {
            connect(m_route, &Route::itemRemoved, this, [this](int index, RouteItem* waypoint) {
                if (m_waypoint == waypoint)
                    this->setWaypointIndex(-1);
            });
        }

        emit routeChanged();
    }

    this->setWaypointIndex(index);
}

void RouteItemController::setWaypointIndex(int index)
{
    RouteItem* waypoint = m_route ? m_route->item(index) : nullptr;

    if (m_waypoint == waypoint)
        return;

    if (m_waypoint)
        disconnect(m_waypoint, nullptr, this, nullptr);

    m_waypoint = waypoint;

    if (m_waypoint)
    {
        emit setWaypointSelected(m_route->id, index, true);
        connect(m_waypoint, &RouteItem::changed, this, &RouteItemController::waypointChanged);
    }
    else
    {
        emit closeEditor();
    }

    emit waypointChanged();
}

void RouteItemController::setCurrentWaypointSelected(bool selected)
{
    if (!m_route || !m_waypoint)
        return;

    emit setWaypointSelected(m_route->id, m_route->index(m_waypoint), selected);
}

void RouteItemController::updatePopupPosition(double x, double y)
{
    emit updatePosition(x, y);
}

void RouteItemController::renameWaypoint(const QString& name)
{
    if (!m_route || !m_waypoint)
        return;

    m_waypoint->name = name;
    m_routesService->saveItem(m_route, m_waypoint);
}

void RouteItemController::changeWaypointItemType(const QString& typeId)
{
    if (!m_route || !m_waypoint)
        return;

    const RouteItemType* type = m_route->type()->itemType(typeId);
    if (!type)
        return;

    if (m_waypoint->type() == type)
        return;

    m_waypoint->setType(type);
    m_routesService->saveItem(m_route, m_waypoint);
}

void RouteItemController::setPosition(double latitude, double longitude, float altitude)
{
    if (!m_route || !m_waypoint)
        return;

    m_waypoint->position.set(Geodetic(latitude, longitude, altitude));
    m_routesService->saveItem(m_route, m_waypoint);
}

void RouteItemController::setWaypointParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_route || !m_waypoint)
        return;

    m_waypoint->setAndCheckParameter(parameterId, value);
    m_routesService->saveItem(m_route, m_waypoint);
}

void RouteItemController::removeWaypoint()
{
    if (!m_route || !m_waypoint)
        return;

    m_route->removeItem(m_waypoint);
    m_routesService->saveRoute(m_route);
}
