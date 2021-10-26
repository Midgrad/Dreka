#include "routes_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

RoutesController::RoutesController(QObject* parent) :
    QObject(parent),
    m_routesRepository(md::app::Locator::get<IRoutesRepository>())
{
    Q_ASSERT(m_routesRepository);
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
}

QVariantList RoutesController::routes() const
{
    return m_routesRepository->routeIds();
}

QVariant RoutesController::selectedRoute() const
{
    return m_selectedRoute;
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

QJsonObject RoutesController::route(const QVariant& routeId) const
{
    Route* route = m_routesRepository->route(routeId);

    if (!route)
        return QJsonObject();

    return QJsonObject::fromVariantMap(route->toVariantMap(true));
}

void RoutesController::addNewRoute(const QString& routeType)
{
    // TODO create new route()
}

void RoutesController::selectRoute(const QVariant& selectedRoute)
{
    if (m_selectedRoute == selectedRoute)
        return;

    m_selectedRoute = selectedRoute;
    emit selectedRouteChanged(selectedRoute);
}

void RoutesController::save(const QVariant& routeId, const QJsonObject& data)
{
    Route* route = m_routesRepository->route(routeId);
    if (!route)
        return;

    route->fromVariantMap(data.toVariantMap());
    m_routesRepository->saveRoute(route);
}

void RoutesController::remove(const QVariant& routeId)
{
    Route* route = m_routesRepository->route(routeId);
    if (!route)
        return;

    m_routesRepository->removeRoute(route);
}

void RoutesController::onRouteAdded(Route* route)
{
    // NOTE: .toString() is a workaround, cause Qt Web Channel loses {} in QUuid
    auto routeId = route->id().toString();
    // TODO: special signals for waypoints
    connect(route, &Route::waypointChanged, this, [this, routeId] {
        emit routeChanged(routeId);
    });
    connect(route, &Route::waypointAdded, this, [this, routeId] {
        emit routeChanged(routeId);
    });
    connect(route, &Route::waypointRemoved, this, [this, routeId] {
        emit routeChanged(routeId);
    });
    emit routeAdded(routeId);
    emit routesChanged();
}

void RoutesController::onRouteRemoved(Route* route)
{
    auto routeId = route->id().toString();
    disconnect(route, nullptr, this, nullptr);

    emit routeRemoved(routeId);
    emit routesChanged();
}
