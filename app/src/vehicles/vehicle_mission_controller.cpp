#include "vehicle_mission_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

VehicleMissionController::VehicleMissionController(QObject* parent) :
    QObject(parent),
    m_vehicleMissions(md::app::Locator::get<IVehicleMissions>())
{
    Q_ASSERT(m_vehicleMissions);
}

QVariant VehicleMissionController::vehicleId() const
{
    return m_vehicleId;
}

QJsonObject VehicleMissionController::mission() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->toVariantMap());
}

QStringList VehicleMissionController::routeItems() const
{
    if (!m_route)
        return QStringList();

    QStringList list;
    int index = 0;
    for (MissionRouteItem* item : m_route->items())
    {
        list.append(item->name + " " + QString::number(index));
        index++;
    }

    return list;
}

int VehicleMissionController::currentItem() const
{
    if (!m_route)
        return -1;

    return m_route->currentIndex();
}

void VehicleMissionController::setVehicleId(const QVariant& vehicleId)
{
    if (m_vehicleId == vehicleId)
        return;

    m_vehicleId = vehicleId;
    emit vehicleIdChanged();

    this->setMission(m_vehicleMissions->missionForVehicle(vehicleId));
}

void VehicleMissionController::setMission(domain::Mission* mission)
{
    if (m_mission == mission)
        return;

    if (m_mission)
    {
        disconnect(m_mission, nullptr, this, nullptr);
    }

    m_mission = mission;

    if (m_mission)
    {
        connect(m_mission, &Mission::changed, this, &VehicleMissionController::missionChanged);
        this->setRoute(m_mission->route);
    }
    else
    {
        this->setRoute(nullptr);
    }

    emit missionChanged();
}

void VehicleMissionController::setRoute(domain::MissionRoute* route)
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
        connect(m_route, &MissionRoute::currentChanged, this,
                &VehicleMissionController::currentItemChanged);
        connect(m_route, &MissionRoute::itemAdded, this,
                &VehicleMissionController::routeItemsChanged);
        connect(m_route, &MissionRoute::itemRemoved, this,
                &VehicleMissionController::routeItemsChanged);
        connect(m_route, &MissionRoute::itemChanged, this,
                &VehicleMissionController::routeItemsChanged);
    }

    emit routeItemsChanged();
    emit currentItemChanged();
}

void VehicleMissionController::switchCurrentItem(int index)
{
    if (!m_route)
        return;

    emit m_route->goTo(index);
}
