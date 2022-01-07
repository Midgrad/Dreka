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

    return m_mission->vehicleId;
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

    return QJsonObject::fromVariantMap(m_mission->home()->toVariantMap());
}

QJsonObject MissionRouteController::target() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->target()->toVariantMap());
}

QStringList MissionRouteController::routeItems() const
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

int MissionRouteController::currentItem() const
{
    if (!m_mission)
        return -1;

    return m_mission->currentItem();
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

    if (m_mission)
    {
        connect(m_mission->home(), &RouteItem::changed, this, [this]() {
            emit homeChanged(this->home());
        });
        connect(m_mission->target(), &RouteItem::changed, this, [this]() {
            emit targetChanged(this->target());
        });
        connect(m_mission, &Mission::currentItemChanged, this,
                &MissionRouteController::currentItemChanged);
        connect(m_mission, &Mission::routeChanged, this, &MissionRouteController::setRoute);
    }
    this->setRoute(mission ? mission->route() : nullptr);

    emit missionChanged();
    emit homeChanged(this->home());
}

void MissionRouteController::setRoute(domain::Route* route)
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
        connect(m_route, &Route::itemAdded, this, &MissionRouteController::routeItemsChanged);
        connect(m_route, &Route::itemRemoved, this, &MissionRouteController::routeItemsChanged);
        connect(m_route, &Route::itemChanged, this, &MissionRouteController::routeItemsChanged);
    }

    emit routeItemsChanged();
}

void MissionRouteController::switchItem(int index)
{
    if (!m_mission)
        return;

    emit m_mission->goTo(index);
}

void MissionRouteController::navTo(double latitude, double longitude)
{
    if (!m_mission)
        return;

    emit m_mission->navTo(latitude, longitude, m_mission->target()->position().altitude);
}
