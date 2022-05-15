#include "mission_route_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionRouteController::MissionRouteController(QObject* parent) :
    QObject(parent),
    m_missions(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missions);
}

QVariant MissionRouteController::missionId() const
{
    return m_mission ? m_mission->id() : QVariant();
}

QJsonArray MissionRouteController::routeItems() const
{
    if (!m_mission)
        return QJsonArray();

    QJsonArray list;
    for (MissionRouteItem* item : m_mission->route()->items())
    {
        list.append(QJsonObject::fromVariantMap(item->toVariantMap()));
    }
    return list;
}

int MissionRouteController::count() const
{
    return m_mission ? m_mission->route()->count() : 0;
}

void MissionRouteController::selectMission(const QVariant& missionId)
{
    Mission* mission = m_missions->mission(missionId);
    if (m_mission == mission)
        return;

    if (m_mission)
    {
        disconnect(m_mission->route, nullptr, this, nullptr);
        disconnect(m_mission, nullptr, this, nullptr);
    }

    m_mission = mission;
    if (m_mission)
    {
        connect(m_mission, &Mission::changed, this, &MissionRouteController::missionChanged);
        connect(m_mission->route, &MissionRoute::changed, this,
                &MissionRouteController::routeItemsChanged);
    }

    emit missionChanged();
    emit routeItemsChanged();
}
