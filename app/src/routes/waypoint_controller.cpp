#include "waypoint_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

WaypointController::WaypointController(QObject* parent) :
    QObject(parent),
    m_routesRepository(md::app::Locator::get<IRoutesRepository>())
{
    connect(m_routesRepository, &IRoutesRepository::routeRemoved, this, [this](Route* route) {
        if (m_route != route)
            return;

        m_route = nullptr;
        emit routeChanged();
        this->setWaypointIndex(-1);
    });
}

QJsonObject WaypointController::waypoint() const
{
    if (!m_waypoint)
        return QJsonObject();

    QVariantMap waypoint = m_waypoint->toVariantMap();

    if (m_route)
        waypoint.insert(props::route, m_route->id());

    // TODO: route items from waypoint

    return QJsonObject::fromVariantMap(waypoint);
}

int WaypointController::waypointIndex() const
{
    if (!m_route || !m_waypoint)
        return -1;

    return m_route->waypointIndex(m_waypoint);
}

int WaypointController::waypointsCount() const
{
    if (!m_route)
        return -1;

    return m_route->waypointsCount();
}

QJsonArray WaypointController::waypointTypes() const
{
    if (!m_route)
        return QJsonArray();

    QJsonArray jsons;
    for (auto wptType : m_route->type()->waypointTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(wptType->toVariantMap()));
    }
    return jsons;
}

QJsonArray WaypointController::waypointItemTypes() const
{
    if (!m_waypoint)
        return QJsonArray();

    QJsonArray jsons;
    for (auto itemType : m_waypoint->type()->itemTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(itemType->toVariantMap()));
    }
    return jsons;
}

QJsonArray WaypointController::waypointParameters() const
{
    if (!m_waypoint)
        return QJsonArray();

    QJsonArray jsons;
    for (auto parameter : m_waypoint->type()->parameters.values())
    {
        QVariantMap map = parameter->toVariantMap();
        map.insert(props::value, m_waypoint->parameter(parameter->id));
        jsons.append(QJsonObject::fromVariantMap(map));
    }
    return jsons;
}

void WaypointController::invokeWaypointMenu(const QVariant& routeId, int index, double x, double y)
{
    this->setWaypoint(routeId, index);

    if (m_waypoint)
        emit invokeMenu(x, y);
}

void WaypointController::setWaypoint(const QVariant& routeId, int index)
{
    Route* route = m_routesRepository->route(routeId);
    if (m_route != route)
    {
        if (m_route)
            disconnect(m_route, nullptr, this, nullptr);

        m_route = route;

        if (m_route)
        {
            connect(m_route, &Route::waypointRemoved, this, [this](int index, Waypoint* waypoint) {
                if (m_waypoint == waypoint)
                    this->setWaypointIndex(-1);
            });
        }

        emit routeChanged();
    }

    this->setWaypointIndex(index);
}

void WaypointController::setWaypointIndex(int index)
{
    Waypoint* waypoint = m_route ? m_route->waypoint(index) : nullptr;

    if (m_waypoint == waypoint)
        return;

    if (m_waypoint)
        disconnect(m_waypoint, nullptr, this, nullptr);

    m_waypoint = waypoint;

    if (m_waypoint)
        connect(m_waypoint, &Waypoint::changed, this, &WaypointController::waypointChanged);

    emit waypointChanged();
}

void WaypointController::changeWaypointType(const QString& typeId)
{
    if (!m_route || !m_waypoint)
        return;

    const WaypointType* type = m_route->type()->waypointType(typeId);
    if (!type)
        return;

    if (m_waypoint->type() == type)
        return;

    m_waypoint->setType(type);
    m_routesRepository->saveWaypoint(m_route, m_waypoint);
}

void WaypointController::setWaypointPosition(double latitude, double longitude, float altitude)
{
    if (!m_route || !m_waypoint)
        return;

    m_waypoint->setPosition(Geodetic(latitude, longitude, altitude));
    m_routesRepository->saveWaypoint(m_route, m_waypoint);
}

void WaypointController::setWaypointParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_route || !m_waypoint)
        return;

    m_waypoint->setAndCheckParameter(parameterId, value);
    m_routesRepository->saveWaypoint(m_route, m_waypoint);
}

void WaypointController::remove()
{
    if (!m_route || !m_waypoint)
        return;

    m_route->removeWaypoint(m_waypoint);
    m_routesRepository->saveRoute(m_route);
}
