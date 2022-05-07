#include "missions_map_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionsMapController::MissionsMapController(QObject* parent) :
    QObject(parent),
    m_missions(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missions);

    connect(m_missions, &IMissionsService::missionAdded, this, [this](Mission* mission) {
        emit missionAdded(mission->toVariantMap());
    });
    connect(m_missions, &IMissionsService::missionChanged, this, [this](Mission* mission) {
        emit missionChanged(mission->toVariantMap());
    });
    connect(m_missions, &IMissionsService::missionRemoved, this, [this](Mission* mission) {
        emit missionRemoved(mission->id);
    });
}

QVariant MissionsMapController::selectedMissionId() const
{
    return m_selectedMissionId;
}

QJsonArray MissionsMapController::missions() const
{
    QJsonArray missions;
    for (Mission* mission : m_missions->missions())
    {
        missions += QJsonObject::fromVariantMap(mission->toVariantMap());
    }
    return missions;
}

QJsonObject MissionsMapController::route(const QVariant& missionId) const
{
    Mission* mission = m_missions->mission(missionId);
    if (!mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(mission->route()->toVariantMap());
}

QJsonArray MissionsMapController::routeItems(const QVariant& missionId) const
{
    Mission* mission = m_missions->mission(missionId);
    if (!mission)
        return QJsonArray();

    QJsonArray items;
    for (MissionRouteItem* item : mission->route()->items())
    {
        items.append(QJsonObject::fromVariantMap(item->toVariantMap()));
    }
    return items;
}

void MissionsMapController::selectMission(const QVariant& missionId)
{
    if (m_selectedMissionId == missionId)
        return;

    m_selectedMissionId = missionId;
    emit selectedMissionChanged(missionId);
}

void MissionsMapController::updateVisibility(const QVariant& missionId, bool visible)
{
    Mission* mission = m_missions->mission(missionId);
    if (!mission)
        return;

    mission->visible.set(visible);
    m_missions->saveMission(mission);
}
