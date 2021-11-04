#include "mission_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionController::MissionController(QObject* parent) :
    QObject(parent),
    m_missionsRepository(md::app::Locator::get<IMissionsRepository>())
{
    Q_ASSERT(m_missionsRepository);

    connect(m_missionsRepository, &IMissionsRepository::missionChanged, this,
            [this](Mission* mission) {
                if (m_mission == mission)
                    emit missionChanged();
            });
    connect(m_missionsRepository, &IMissionsRepository::missionRemoved, this,
            [this](Mission* mission) {
                if (m_mission == mission)
                    this->setMission(nullptr);
            });
}

QJsonObject MissionController::mission() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->toVariantMap(false));
}

QJsonObject MissionController::operation() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->operation()->toVariantMap());
}

QJsonObject MissionController::route() const
{
    if (m_route)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_route->toVariantMap(true));
}

QStringList MissionController::waypoints() const
{
    QStringList list;
    if (m_route)
    {
        for (Waypoint* waypoint : m_route->waypoints())
        {
            list.append(waypoint->name());
        }
    }

    return list;
}

int MissionController::currentWaypoint() const
{
    if (!m_route)
        return 0;

    return m_route->currentWaypointIndex();
}

void MissionController::setVehicleId(const QVariant& vehicleId)
{
    this->setMission(m_missionsRepository->missionForVehicle(vehicleId));
}

void MissionController::setMission(Mission* mission)
{
    if (m_mission == mission)
        return;

    if (m_mission)
    {
        disconnect(m_mission, nullptr, this, nullptr);
    }

    m_mission = mission;

    if (mission)
    {
        connect(mission->operation(), &MissionOperation::changed, this,
                &MissionController::operationChanged);
        connect(mission, &Mission::routeChanged, this, &MissionController::onRouteChanged);

        if (mission->route())
        {
            this->onRouteChanged(mission->route());
        }
    }

    if (!mission || !mission->route())
    {
        this->onRouteChanged(nullptr);
    }

    emit missionChanged();
    emit operationChanged();
}

void MissionController::save(const QJsonObject& data)
{
    if (!m_mission)
        return;

    m_mission->fromVariantMap(data.toVariantMap());
    m_missionsRepository->saveMission(m_mission);
}

void MissionController::remove()
{
    if (!m_mission)
        return;

    m_missionsRepository->removeMission(m_mission);
}

void MissionController::upload()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->upload();
}

void MissionController::download()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->download();
}

void MissionController::clear()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->clear();
}

void MissionController::cancel()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->cancel();
}

void MissionController::switchWaypoint(int index)
{
    if (!m_route)
        return;

    emit m_route->switchWaypoint(index);
}

void MissionController::onRouteChanged(Route* route)
{
    if (m_route && m_route != route)
    {
        disconnect(m_route, nullptr, this, nullptr);
    }

    m_route = route;

    if (route)
    {
        connect(route, &Route::currentWaypointChanged, this,
                &MissionController::currentWaypointChanged);
        connect(route, &Route::waypointAdded, this, &MissionController::routeChanged);
        connect(route, &Route::waypointChanged, this, &MissionController::routeChanged);
        connect(route, &Route::waypointRemoved, this, &MissionController::routeChanged);
    }

    emit routeChanged();
    emit currentWaypointChanged();
}
