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

QJsonObject MissionController::missionStatus() const
{
    if (!m_mission)
        return QJsonObject::fromVariantMap(MissionStatus().toVariantMap());

    return QJsonObject::fromVariantMap(m_mission->missionStatus().toVariantMap());
}

QJsonObject MissionController::route() const
{
    if (!m_mission || !m_mission->route())
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->route()->toVariantMap(true));
}

QStringList MissionController::waypoints() const
{
    QStringList list;
    if (m_mission && m_mission->route())
    {
        for (Waypoint* waypoint : m_mission->route()->waypoints())
        {
            list.append(waypoint->name());
        }
    }

    return list;
}

int MissionController::currentWaypoint() const
{
    if (!m_routeStatus)
        return 0;

    return m_routeStatus->currentWaypoint();
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
        connect(mission, &Mission::statusChanged, this, &MissionController::missionStatusChanged);
        connect(mission, &Mission::routeChanged, this, &MissionController::onRouteChanged);

        if (mission->route())
        {
            this->onRouteChanged(mission->route(), mission->routeStatus());
        }
    }

    if (!mission || !mission->route())
    {
        this->onRouteChanged(nullptr, nullptr);
    }

    emit missionChanged();
    emit missionStatusChanged();
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

    emit m_mission->upload();
}

void MissionController::download()
{
    if (!m_mission)
        return;

    emit m_mission->download();
}

void MissionController::clear()
{
    if (!m_mission)
        return;

    emit m_mission->clear();
}

void MissionController::cancel()
{
    if (!m_mission)
        return;

    emit m_mission->cancel();
}

void MissionController::switchWaypoint(int index)
{
    if (!m_routeStatus)
        return;

    emit m_routeStatus->switchWaypoint(index);
}

void MissionController::onRouteChanged(Route* route, RouteStatus* routeStatus)
{
    if (m_routeStatus && m_routeStatus != routeStatus)
    {
        disconnect(m_routeStatus, nullptr, this, nullptr);
    }

    m_routeStatus = routeStatus;

    if (routeStatus)
    {
        connect(routeStatus, &RouteStatus::currentWaypointChanged, this,
                &MissionController::currentWaypointChanged);
    }

    emit routeChanged();
    emit currentWaypointChanged();
}
