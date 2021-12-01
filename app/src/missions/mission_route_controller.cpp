#include "mission_route_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionRouteController::MissionRouteController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missionsService);

    connect(m_missionsService, &IMissionsService::missionChanged, this, [this](Mission* mission) {
        if (m_mission == mission)
            emit missionChanged();
    });
    connect(m_missionsService, &IMissionsService::missionRemoved, this, [this](Mission* mission) {
        if (m_mission == mission)
            this->setMission(nullptr);
    });
}

QVariant MissionRouteController::vehicleId() const
{
    if (!m_mission)
        return QVariant();

    return m_mission->vehicleId();
}

QJsonObject MissionRouteController::mission() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->toVariantMap());
}

QJsonObject MissionRouteController::home() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->homePoint()->toVariantMap());
}

QStringList MissionRouteController::routeItems() const
{
    if (!m_mission)
        return QStringList();

    int index = 0;
    QStringList list;
    for (MissionRouteItem* item : m_mission->items())
    {
        list.append(item->underlyingItem()->name() + " " + QString::number(index));
        index++;
    }

    return list;
}

int MissionRouteController::currentItem() const
{
    if (!m_route)
        return -1;

    return m_route->currentItem();
}

void MissionRouteController::setVehicleId(const QVariant& vehicleId)
{
    this->setMission(m_missionsService->missionForVehicle(vehicleId));
}

void MissionRouteController::setMission(Mission* mission)
{
    if (m_mission == mission)
        return;

    if (m_mission)
    {
        disconnect(m_mission, nullptr, this, nullptr);
    }

    m_mission = mission;
    this->setMissionRoute(mission ? mission->route() : nullptr);

    if (mission)
    {
        connect(mission->homePoint(), &RouteItem::changed, this, [this]() {
            emit homeChanged(this->home());
        });
        connect(mission, &Mission::routeChanged, this, &MissionRouteController::setMissionRoute);
    }

    emit missionChanged();
    emit homeChanged(this->home());
}

void MissionRouteController::setMissionRoute(domain::MissionRoute* route)
{
    if (m_route == route)
        return;

    if (m_route)
    {
        disconnect(m_route, nullptr, this, nullptr);
    }

    m_route = route;

    if (m_route)
    {
        connect(m_route, &MissionRoute::itemsChanged, this,
                &MissionRouteController::routeItemsChanged);
        connect(m_route, &MissionRoute::currentItemChanged, this,
                &MissionRouteController::currentItemChanged);
    }
    emit routeItemsChanged();
}

void MissionRouteController::switchItem(int index)
{
    if (!m_mission)
        return;

    emit m_mission->switchCurrentItem(index);
}
