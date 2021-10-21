#include "routes_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

RoutesController::RoutesController(QObject* parent) :
    QObject(parent),
    m_routesService(md::app::Locator::get<IRoutesService>())
{
    Q_ASSERT(m_routesService);
    connect(m_routesService, &IRoutesService::routeTypesChanged, this,
            &RoutesController::routeTypesChanged);
    connect(m_routesService, &IRoutesService::routeAdded, this, &RoutesController::onRouteAdded);
    connect(m_routesService, &IRoutesService::routeRemoved, this, &RoutesController::onRouteRemoved);
    connect(m_routesService, &IRoutesService::routeChanged, this, [this](Route* route) {
        emit routeChanged(route->id());
    });

    for (Route* route : m_routesService->routes())
    {
        this->onRouteAdded(route);
    }
}

QVariantList RoutesController::routes() const
{
    return m_routesService->routeIds();
}

QVariant RoutesController::selectedRoute() const
{
    return m_selectedRoute;
}

QStringList RoutesController::routeTypes() const
{
    QStringList routeTypes;
    for (auto routeType : m_routesService->routeTypes())
    {
        routeTypes += routeType->name;
    }
    return routeTypes;
}

QJsonObject RoutesController::route(const QVariant& routeId) const
{
    Route* route = m_routesService->route(routeId);
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
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    route->fromVariantMap(data.toVariantMap());
    m_routesService->saveRoute(route);
}

void RoutesController::remove(const QVariant& routeId)
{
    Route* route = m_routesService->route(routeId);
    if (!route)
        return;

    m_routesService->removeRoute(route);
}

void RoutesController::onRouteAdded(Route* route)
{
    emit routesChanged();
}

void RoutesController::onRouteRemoved(Route* route)
{
    disconnect(route, nullptr, this, nullptr);
    emit routesChanged();
}
