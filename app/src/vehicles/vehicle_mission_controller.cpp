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

QJsonObject VehicleMissionController::home() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->home()->toVariantMap());
}

QJsonObject VehicleMissionController::target() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->target()->toVariantMap());
}

QStringList VehicleMissionController::routeItems() const
{
    if (!m_mission)
        return QStringList();

    QStringList list;

    list.append(m_mission->home()->name);

    if (m_route)
    {
        int index = 1;
        for (RouteItem* item : m_route->items())
        {
            list.append(item->name + " " + QString::number(index));
            index++;
        }
    }

    return list;
}

int VehicleMissionController::currentItem() const
{
    if (!m_mission)
        return -1;

    return m_mission->currentItem();
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
        connect(m_mission->home(), &RouteItem::changed, this, [this]() {
            emit homeChanged(this->home());
        });
        connect(m_mission->target(), &RouteItem::changed, this, [this]() {
            emit targetChanged(this->target());
        });
        connect(m_mission, &Mission::currentItemChanged, this,
                &VehicleMissionController::currentItemChanged);
        connect(m_mission, &Mission::routeChanged, this, &VehicleMissionController::setRoute);
    }
    this->setRoute(mission ? mission->route() : nullptr);

    emit missionChanged();
    emit homeChanged(this->home());
}

void VehicleMissionController::setRoute(domain::Route* route)
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
        connect(m_route, &Route::itemAdded, this, &VehicleMissionController::routeItemsChanged);
        connect(m_route, &Route::itemRemoved, this, &VehicleMissionController::routeItemsChanged);
        connect(m_route, &Route::itemChanged, this, &VehicleMissionController::routeItemsChanged);
    }

    emit routeItemsChanged();
}

void VehicleMissionController::switchItem(int index)
{
    if (!m_mission)
        return;

    emit m_mission->goTo(index);
}

void VehicleMissionController::navTo(double latitude, double longitude)
{
    if (!m_mission)
        return;

    emit m_mission->navTo(latitude, longitude, m_mission->target()->position().altitude);
}
