#include "vehicle_mission_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

VehicleMissionController::VehicleMissionController(QObject* parent) :
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

QVariant VehicleMissionController::vehicleId() const
{
    if (!m_mission)
        return QVariant();

    return m_mission->vehicleId;
}

QJsonObject VehicleMissionController::mission() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->toVariantMap());
}

QStringList VehicleMissionController::routeItems() const
{
    if (!m_mission)
        return QStringList();

    QStringList list;

    int index = 0;
    for (MissionRouteItem* item : m_mission->route()->items())
    {
        list.append(item->name + " " + QString::number(index));
        index++;
    }

    return list;
}

int VehicleMissionController::currentItem() const
{
    if (!m_mission)
        return -1;

    return m_mission->route()->currentIndex();
}

void VehicleMissionController::setVehicleId(const QVariant& vehicleId)
{
    this->setMission(m_missionsService->missionForVehicle(vehicleId));
}

void VehicleMissionController::setMission(Mission* mission)
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
        connect(m_mission, &Mission::changed, this, &VehicleMissionController::routeItemsChanged);
    }

    emit missionChanged();
}

void VehicleMissionController::switchItem(int index)
{
    if (!m_mission)
        return;

    emit m_mission->goTo(index);
}

//void VehicleMissionController::navTo(double latitude, double longitude)
//{
//    if (!m_mission)
//        return;

//    //FIXME: emit m_mission->navTo(latitude, longitude, m_mission->target()->position().altitude);
//}
