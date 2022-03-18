#include "missions_controller.h"

#include <QDebug>

#include "locator.h"
#include "mission_traits.h"

using namespace md::domain;
using namespace md::presentation;

MissionsController::MissionsController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missionsService);

    connect(m_missionsService, &IMissionsService::missionTypesChanged, this,
            &MissionsController::missionTypesChanged);
    connect(m_missionsService, &IMissionsService::missionAdded, this,
            &MissionsController::onMissionAdded);
    connect(m_missionsService, &IMissionsService::missionRemoved, this,
            &MissionsController::onMissionRemoved);

    for (Mission* mission : m_missionsService->missions())
    {
        this->onMissionAdded(mission);
    }
}

QJsonArray MissionsController::missionTypes() const
{
    QJsonArray jsons;
    for (auto routeType : m_missionsService->missionTypes())
    {
        jsons.append(QJsonObject::fromVariantMap(routeType->toVariantMap()));
    }
    return jsons;
}

QVariantList MissionsController::missionIds() const
{
    return m_missionsService->missionIds();
}

QVariant MissionsController::selectedMission() const
{
    return m_selectedMission ? m_selectedMission->id() : QVariant();
}

int MissionsController::selectedItemIndex() const
{
    return m_selectedItemIndex;
}

QJsonObject MissionsController::routeData(const QVariant& routeId) const
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return QJsonObject();

    MissionRoute* route = mission->route();
    QVariantMap routeData = mission->toVariantMap();
    routeData[props::items] = route->count();
    routeData[props::type] = mission->type()->name;

    return QJsonObject::fromVariantMap(routeData);
}

QJsonObject MissionsController::routeItemData(const QVariant& routeId, int index) const
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return QJsonObject();

    MissionRouteItem* routeItem = mission->route()->item(index);
    if (!routeItem)
        return QJsonObject();

    return QJsonObject::fromVariantMap(routeItem->toVariantMap());
}

QJsonArray MissionsController::routeItemTypes(const QVariant& routeId) const
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return QJsonArray();

    QJsonArray jsons;
    for (auto wptType : mission->type()->itemTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(wptType->toVariantMap()));
    }
    return jsons;
}

QJsonArray MissionsController::patternTypes(const QVariant& routeId) const
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return QJsonArray();

    QJsonArray jsons;
    for (auto pattern : mission->type()->patternTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(pattern->toVariantMap()));
    }
    return jsons;
}

void MissionsController::selectMission(const QVariant& selectedMissionId)
{
    auto selectedMission = m_missionsService->mission(selectedMissionId);

    if (m_selectedMission == selectedMission)
        return;

    if (selectedMission)
        selectedMission->route()->visible.set(true);

    m_selectedMission = selectedMission;
    emit selectedMissionChanged(selectedMissionId);

    this->selectItemIndex(-1);
}

void MissionsController::selectItemIndex(int index)
{
    if (m_selectedItemIndex == index)
        return;

    m_selectedItemIndex = index;
    emit selectedItemIndexChanged(index);
}

void MissionsController::addNewMission(const QString& missionTypeId)
{
    // FIMXE: mission for vehicle
    //    auto missionType = m_missionsService->missionType(missionTypeId);
    //    if (!missionType)
    //    {
    //        qWarning() << "Unknown mission type";
    //        return;
    //    }

    //    QStringList missionNames;
    //    for (Mission* mission : m_missionsService->missions())
    //    {
    //        missionNames += mission->name;
    //    }

    //    auto mission = new Mission(missionType, utils::nameFromType(missionType->name, missionNames),);
    //    m_missionsService->saveRoute(route);
    //    this->selectMission(route->id);
}

void MissionsController::updateRoute(const QVariant& routeId, const QJsonObject& data)
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return;

    mission->route()->fromVariantMap(data.toVariantMap());
    m_missionsService->saveMission(mission);
}

void MissionsController::renameMission(const QVariant& missionId, const QString& name)
{
    Mission* mission = m_missionsService->mission(missionId);
    if (!mission)
        return;

    mission->name = name;
    m_missionsService->saveMission(mission);
}

void MissionsController::removeMission(const QVariant& missionId)
{
    Mission* mission = m_missionsService->mission(missionId);
    if (!mission)
        return;

    if (m_selectedMission == mission)
        this->selectMission(QVariant());

    m_missionsService->removeMission(mission);
}

void MissionsController::addRouteItem(const QVariant& routeId, const QString& typeId,
                                      const QVariantMap& position)
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return;

    const MissionItemType* type = mission->type()->itemType(typeId);
    if (!type)
        return;

    MissionRoute* route = mission->route();

    // Special case for altitude
    QVariantMap parameters = type->defaultParameters();

    float altitude = route->count() ? route->item(route->count() - 1)->position().altitude()
                                    : position.value(geo::altitude, 0).toFloat();
    QVariantMap newPosition = position;
    newPosition[geo::altitude] = altitude;

    MissionRouteItem* item = new MissionRouteItem(type, type->shortName, utils::generateId(), parameters,
                                        newPosition);
    item->setParameters(parameters);
    route->addItem(item);

    m_missionsService->saveItem(route, item);
}

void MissionsController::updateRouteItemData(const QVariant& routeId, int index,
                                             const QJsonObject& data)
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return;

    MissionRouteItem* routeItem = mission->route()->item(index);
    if (!routeItem)
        return;

    routeItem->fromVariantMap(data.toVariantMap());
    m_missionsService->saveItem(mission->route(), routeItem);
}

void MissionsController::removeItem(const QVariant& routeId, int index)
{
    Mission* mission = m_missionsService->mission(routeId);
    if (!mission)
        return;

    MissionRouteItem* routeItem = mission->route()->item(index);
    if (!routeItem)
        return;

    mission->route()->removeItem(routeItem);
    m_missionsService->saveMission(mission);
}

void MissionsController::onMissionAdded(Mission* mission)
{
    emit missionAdded(mission->id);
    emit missionIdsChanged();

    connect(mission->route(), &MissionRoute::itemAdded, this,
            [this, mission](int index, MissionRouteItem*) {
                emit routeItemAdded(mission->id, index);
            });
    connect(mission->route(), &MissionRoute::itemRemoved, this,
            [this, mission](int index, MissionRouteItem*) {
                if (index == m_selectedItemIndex)
                {
                    this->selectItemIndex(-1);
                }
                else if (index < m_selectedItemIndex)
                {
                    this->selectItemIndex(m_selectedItemIndex - 1);
                }
                emit routeItemRemoved(mission->id, index);
            });
    connect(mission->route(), &MissionRoute::itemChanged, this,
            [this, mission](int index, MissionRouteItem*) {
                emit routeItemChanged(mission->id, index);
            });
    connect(mission, &MissionRoute::changed, this, [mission, this]() {
        emit missionChanged(mission->id);
    });
}

void MissionsController::onMissionRemoved(Mission* mission)
{
    disconnect(mission, nullptr, this, nullptr);

    emit missionRemoved(mission->id);
    emit missionIdsChanged();
}
