#include "routes_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

RoutesController::RoutesController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missionsService);
    connect(m_missionsService, &IMissionsService::missionTypesChanged, this,
            &RoutesController::routeTypesChanged);
    connect(m_missionsService, &IMissionsService::missionAdded, this, [this](Mission* mission) {
        this->onRouteAdded(mission->route());
    });
    connect(m_missionsService, &IMissionsService::missionRemoved, this, [this](Mission* mission) {
        this->onRouteRemoved(mission->route());
    });
    connect(m_missionsService, &IMissionsService::missionChanged, this, [this](Mission* mission) {
        emit routeChanged(mission->id());
    });

    for (Mission* mission : m_missionsService->missions())
    {
        this->onRouteAdded(mission->route());
    }
}

QVariantList RoutesController::routes() const
{
    return m_missionsService->missionIds();
}

QVariant RoutesController::selectedRoute() const
{
    return m_selectedRoute;
}

QStringList RoutesController::routeTypes() const
{
    QStringList missionTypes;
    for (auto missionType : m_missionsService->missionTypes())
    {
        missionTypes += missionType->routeType->name;
    }
    return missionTypes;
}

QJsonObject RoutesController::route(const QVariant& routeId) const
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(mission->route()->toVariantMap(true));
}

void RoutesController::addNewRoute(const QString& missionType)
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
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return;

    mission->fromVariantMap(data.toVariantMap());
    m_missionsService->saveMission(mission);
}

void RoutesController::remove(const QVariant& routeId)
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return;

    m_missionsService->removeMission(mission);
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
