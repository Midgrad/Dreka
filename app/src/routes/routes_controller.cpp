#include "routes_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RoutesController::RoutesController(QObject* parent) :
    QObject(parent),
    m_routesService(md::app::Locator::get<IRoutesService>()),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_routesService);
    Q_ASSERT(m_missionsService);

    connect(m_routesService, &IRoutesService::routeTypesChanged, this,
            &RoutesController::routeTypesChanged);
    connect(m_routesService, &IRoutesService::routeAdded, this, &RoutesController::onRouteAdded);
    connect(m_routesService, &IRoutesService::routeRemoved, this, &RoutesController::onRouteRemoved);
    connect(m_routesService, &IRoutesService::routeChanged, this, [this](Route* route) {
        if (route == m_selectedRoute)
            emit selectedRouteChanged(route->id());
    });

    for (Route* route : m_routesService->routes())
    {
        this->onRouteAdded(route);
    }

    connect(m_missionsService, &IMissionsService::missionRemoved, this,
            [this](Mission* mission) {
                if (m_activeMission == mission)
                    this->setActiveMission(QVariant());
            });
}

QJsonArray RoutesController::routeTypes() const
{
    QJsonArray jsons;
    for (auto routeType : m_routesService->routeTypes())
    {
        jsons.append(QJsonObject::fromVariantMap(routeType->toVariantMap()));
    }
    return jsons;
}

QVariantList RoutesController::routeIds() const
{
    return m_routesService->routeIds();
}

QVariant RoutesController::selectedRoute() const
{
    return m_selectedRoute ? m_selectedRoute->id() : QVariant();
}

QJsonObject RoutesController::routeData(const QVariant& routeId) const
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return QJsonObject();

    QVariantMap routeData = route->toVariantMap();
    routeData[props::items] = route->count();
    routeData[props::type] = route->type()->name;

    return QJsonObject::fromVariantMap(routeData);
}

QJsonObject RoutesController::waypointData(const QVariant& routeId, int index) const
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return QJsonObject();

    RouteItem* waypoint = route->item(index);
    if (!waypoint)
        return QJsonObject();

    return QJsonObject::fromVariantMap(waypoint->toVariantMap());
}

QJsonArray RoutesController::waypointTypes(const QVariant& routeId) const
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return QJsonArray();

    QJsonArray jsons;
    for (auto wptType : route->type()->itemTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(wptType->toVariantMap()));
    }
    return jsons;
}

void RoutesController::setActiveMission(const QVariant& missionId)
{
    m_activeMission = m_missionsService->mission(missionId);

    if (m_activeMission && m_activeMission->route() && !m_selectedRoute)
    {
        this->selectRoute(m_activeMission->route()->id());
    }
}

void RoutesController::selectRoute(const QVariant& selectedRouteId)
{
    auto selectedRoute = m_routesService->route(selectedRouteId);

    if (m_selectedRoute == selectedRoute)
        return;

    m_selectedRoute = selectedRoute;
    emit selectedRouteChanged(selectedRouteId);
}

void RoutesController::addNewRoute(const QString& routeTypeId)
{
    auto routeType = m_routesService->routeType(routeTypeId);
    if (!routeType)
    {
        qWarning() << "Unknown route type";
        return;
    }

    QStringList routeNames;
    for (Route* route : m_routesService->routes())
    {
        routeNames += route->name();
    }

    auto route = new Route(routeType, utils::nameFromType(routeType->name, routeNames));
    m_routesService->saveRoute(route);
    this->selectRoute(route->id());
}

void RoutesController::updateRoute(const QVariant& routeId, const QJsonObject& data)
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    route->fromVariantMap(data.toVariantMap());
    m_routesService->saveRoute(route);
}

void RoutesController::renameRoute(const QVariant& routeId, const QString& name)
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    route->setName(name);
    m_routesService->saveRoute(route);
}

void RoutesController::removeRoute(const QVariant& routeId)
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    if (m_selectedRoute == route)
        this->selectRoute(QVariant());

    m_routesService->removeRoute(route);
}

void RoutesController::addWaypoint(const QVariant& routeId, const QString& wptTypeId,
                                   const QVariantMap& args)
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    const RouteItemType* wptType = route->type()->itemType(wptTypeId);
    if (!wptType)
        return;

    // Special case for altitude
    QVariantMap parameters = wptType->defaultParameters();
    utils::mergeMap(parameters, args);
    float altitude = route->count()
                         ? route->item(route->count() - 1)->parameter(route::altitude.id).toFloat()
                         : args.value(geo::altitude, 0).toFloat();
    parameters[geo::altitude] = altitude;

    RouteItem* wpt = new RouteItem(wptType);
    wpt->setParameters(parameters);
    route->addItem(wpt);

    m_routesService->saveItem(route, wpt);
}

void RoutesController::updateWaypointData(const QVariant& routeId, int index,
                                          const QJsonObject& data)
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    RouteItem* waypoint = route->item(index);
    if (!waypoint)
        return;

    waypoint->fromVariantMap(data.toVariantMap());
    m_routesService->saveItem(route, waypoint);

    // TODO: Promoute to the vehicle
    //    if (m_activeMission && m_activeMission->route() == route)
    //    {
    //        // setConfirmed(false)
    //        emit m_activeMission->operation()->uploadItem(route->waypointIndex(waypoint));
    //    }
}

void RoutesController::updateWaypointCalcData(const QVariant& routeId, int index,
                                              const QJsonObject& calcData)
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    RouteItem* waypoint = route->item(index);
    if (!waypoint)
        return;

    waypoint->setCalcData(calcData.toVariantMap());
}

void RoutesController::onRouteAdded(Route* route)
{
    emit routeAdded(route->id());
    emit routeIdsChanged();

    connect(route, &Route::itemAdded, this, [this, route](int index, RouteItem* waypoint) {
        emit waypointAdded(route->id(), index);
    });
    connect(route, &Route::itemRemoved, this, [this, route](int index, RouteItem* waypoint) {
        emit waypointRemoved(route->id(), index);
    });
    connect(route, &Route::itemChanged, this, [this, route](int index, RouteItem* waypoint) {
        emit waypointChanged(route->id(), index);
    });
}

void RoutesController::onRouteRemoved(Route* route)
{
    disconnect(route, nullptr, this, nullptr);

    emit routeRemoved(route->id().toString());
    emit routeIdsChanged();
}
