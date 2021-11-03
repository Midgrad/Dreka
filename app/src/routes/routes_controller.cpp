#include "routes_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RoutesController::RoutesController(QObject* parent) :
    QObject(parent),
    m_routesRepository(md::app::Locator::get<IRoutesRepository>()),
    m_missionsRepository(md::app::Locator::get<IMissionsRepository>())
{
    Q_ASSERT(m_routesRepository);
    Q_ASSERT(m_missionsRepository);

    connect(m_routesRepository, &IRoutesRepository::routeTypesChanged, this,
            &RoutesController::routeTypesChanged);
    connect(m_routesRepository, &IRoutesRepository::routeAdded, this,
            &RoutesController::onRouteAdded);
    connect(m_routesRepository, &IRoutesRepository::routeRemoved, this,
            &RoutesController::onRouteRemoved);

    for (Route* route : m_routesRepository->routes())
    {
        this->onRouteAdded(route);
    }

    connect(m_missionsRepository, &IMissionsRepository::missionRemoved, this,
            [this](Mission* mission) {
                if (m_activeMission == mission)
                    this->setActiveMission(QVariant());
            });
}

QStringList RoutesController::routeTypes() const
{
    QStringList routeTypes;
    for (auto routeType : m_routesRepository->routeTypes())
    {
        routeTypes += routeType->name;
    }
    return routeTypes;
}

QVariantList RoutesController::routeIds() const
{
    return m_routesRepository->routeIds();
}

QVariant RoutesController::selectedRoute() const
{
    return m_selectedRoute ? m_selectedRoute->id() : QVariant();
}

QJsonObject RoutesController::routeData(const QVariant& routeId) const
{
    Route* route = m_routesRepository->route(routeId);
    if (!route)
        return QJsonObject();

    QVariantMap routeData = route->toVariantMap(false);
    routeData[params::waypoints] = route->count();

    return QJsonObject::fromVariantMap(routeData);
}

QJsonObject RoutesController::waypointData(const QVariant& routeId, int index) const
{
    Route* route = m_routesRepository->route(routeId);
    if (!route)
        return QJsonObject();

    Waypoint* waypoint = route->waypoint(index);
    if (!waypoint)
        return QJsonObject();

    return QJsonObject::fromVariantMap(waypoint->toVariantMap(false));
}

void RoutesController::setActiveMission(const QVariant& missionId)
{
    m_activeMission = m_missionsRepository->mission(missionId);

    if (m_activeMission && m_activeMission->route() && !m_selectedRoute)
    {
        this->selectRoute(m_activeMission->route()->route()->id());
    }
}

void RoutesController::selectRoute(const QVariant& selectedRouteId)
{
    auto selectedRoute = m_routesRepository->route(selectedRouteId);

    if (m_selectedRoute == selectedRoute)
        return;

    m_selectedRoute = selectedRoute;
    emit selectedRouteChanged(selectedRouteId);
}

void RoutesController::addNewRoute(const QString& routeType)
{
    // TODO create new route()
}

void RoutesController::updateRoute(const QVariant& routeId, const QJsonObject& data)
{
    Route* route = m_routesRepository->route(routeId);
    if (!route)
        return;

    route->fromVariantMap(data.toVariantMap());
}

void RoutesController::removeRoute(const QVariant& routeId)
{
    Route* route = m_routesRepository->route(routeId);
    if (!route)
        return;

    m_routesRepository->removeRoute(route);
}

void RoutesController::updateWaypoint(const QVariant& routeId, int index, const QJsonObject& data)
{
    Route* route = m_routesRepository->route(routeId);
    if (!route)
        return;

    Waypoint* waypoint = route->waypoint(index);
    if (!waypoint)
        return;

    waypoint->fromVariantMap(data.toVariantMap());
}

void RoutesController::removeWaypoint(const QVariant& routeId, int index)
{
    // TODO: impl removeWaypoint
}

void RoutesController::onRouteAdded(Route* route)
{
    emit routeAdded(route->id());
    emit routeIdsChanged();

    connect(route, &Route::waypointAdded, this, [this, route](Waypoint* waypoint) {
        emit waypointAdded(route->id(), route->index(waypoint));
    });
    connect(route, &Route::waypointRemoved, this, [this, route](Waypoint* waypoint) {
        emit waypointRemoved(route->id(), route->index(waypoint));
    });
    connect(route, &Route::waypointChanged, this, [this, route](Waypoint* waypoint) {
        emit waypointChanged(route->id(), route->index(waypoint));
    });
}

void RoutesController::onRouteRemoved(Route* route)
{
    disconnect(route, nullptr, this, nullptr);

    emit routeRemoved(route->id().toString());
    emit routeIdsChanged();
}
